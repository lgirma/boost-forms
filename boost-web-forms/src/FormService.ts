import {humanize, uuid, isDate, isDateTime, isYear, isTime} from 'boost-web-core';
import {
    FormValidationResult,
    ValidationResult,
    ValidateFunc,
    getValidationResult,
    AsyncValidateFunc,
    CustomFieldRenderer,
    FormFieldType,
    FieldConfigBase, WebForm
} from "./Models";
import {notEmpty} from './Validation';


let customFieldRenderers : CustomFieldRenderer[] = []

export function addCustomFieldRenderer(renderer: CustomFieldRenderer): string {
    const id = uuid().substr(0, 8)
    customFieldRenderers.push({...renderer, id})
    return id
}

export function findCustomRenderer(forType: string): CustomFieldRenderer|null {
    return customFieldRenderers.find(cfr =>
        typeof(cfr.forType) === 'string'
            ? forType.toLowerCase() == cfr.forType.toLowerCase()
            : cfr.forType.indexOf(forType) > -1)
}

export function field(value: FieldConfigBase) {
    console.log('value:', value)
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        console.log(target, propertyKey, descriptor)
    };
}

export function createFormConfig(forObject, config: WebForm = {}): WebForm {
    config.fieldsConfig = {
        ...Object.keys(forObject).reduce((a, b) => ({...a, [b]: null}), {}),
        ...config.fieldsConfig
    }
    config.scale ??= 1;
    config.readonly ??= false;
    config.hideLabels ??= false;
    config.excludeSubmitButton ??= false;

    if (!config.excludeSubmitButton) {
        config.fieldsConfig['$$submit'] = {
            ...getDefaultFieldConfig('$$submit', 'submit', config),
            hideLabel: true,
            label: 'Submit'
        }
    }

    Object.keys(forObject).forEach(_ => {
        let fieldId = _;
        let fieldValue = forObject[fieldId];

        let type = config.fieldsConfig[fieldId]?.type ?? guessType(fieldId, fieldValue)

        config.fieldsConfig[fieldId] = {
            ...getDefaultFieldConfig(fieldId, type, config),
            label: humanize(fieldId),
            ...guessConfig(config.fieldsConfig[fieldId], fieldValue, type),
            ...config.fieldsConfig[fieldId],
        }
        config.fieldsConfig[fieldId].choices = (config.fieldsConfig[fieldId]?.choices == null
            ? {}
            : (config.fieldsConfig[fieldId].choices?.constructor === Array
                ? (config.fieldsConfig[fieldId].choices as string[]).reduce((acc, b)=> ({...acc, [b]: b}), {})
                : config.fieldsConfig[fieldId].choices))
    });

    return config;
}

export function getDefaultFieldConfig(fieldId: string, type: FormFieldType, formConfig: WebForm): FieldConfigBase {
    return {
        scale: formConfig.scale,
        readonly: formConfig.readonly,
        hideLabel: formConfig.hideLabels,
        colSpan: 1,
        icon: null,
        helpText: '',
        validationResult: {
            message: '',
            hasError: false
        },
        id: fieldId,
        multiple: false,
        type: type,
    }
}

export function guessType(fieldId, fieldValue): FormFieldType {
    let table : {[regex: string]: FormFieldType} = {
        'password$': 'password',
        'email$': 'email',
        'name$': 'name',
        'quantity$|number$': 'number',
        '^amount|amount$|^price|price$': 'money',
        '^date|date$': 'date', '^year|year$': 'year', '^month|month$': 'month',
        '^phone|phone$': 'tel',
        '^captcha|captcha^': 'reCaptcha',
        '^language|language$': 'language'
    }
    const fieldIdLower = fieldId.toLowerCase()

    for (const reg in table) {
        if (RegExp(reg).test(fieldIdLower))
            return table[reg]
    }
    if (fieldValue == null)
        return 'text';

    const jsType = typeof(fieldValue);

    if (jsType === 'boolean')
        return 'checkbox';
    if (jsType === 'string') {
        if (isDateTime(fieldValue))
            return 'datetime-local';
        if (isDate(fieldValue))
            return 'date';
        if (isTime(fieldValue))
            return 'time';
        if (isYear(fieldValue))
            return 'year';
        return 'text';
    }
    if (jsType === 'number')
        return 'number';
    if (fieldValue.constructor === Array)
        return 'radio';

    return 'text';
}

export function guessConfig(fieldConfig: FieldConfigBase, val: any, fieldType: FormFieldType) : FieldConfigBase {
    let result: FieldConfigBase = {}
    fieldConfig ??= {}
    if (val != null && val.constructor === Array && fieldType == 'radio') {
        result.choices = val.reduce((acc, el) => ({...acc, [el]: humanize(el)}), {})
        result.multiple = true
    }
    if (fieldType == 'password')
        result.required = true
    return result
}

export async function validateForm(forObject, formConfig?: WebForm) : Promise<FormValidationResult> {
    formConfig = createFormConfig(forObject, formConfig)
    let fieldsConfig = formConfig.fieldsConfig;
    let result: FormValidationResult = {
        hasError: false,
        message: '',
        fields: {}
    };
    for (const id in forObject) {
        if (!forObject.hasOwnProperty(id))
            continue;
        const config = fieldsConfig[id]
        result.fields[id] = {
            hasError: false,
            message: null
        }
        if (config == null) continue
        let validate = config.validate
        const value = forObject[id]
        if (config.required) {
            if (validate == null) validate = notEmpty;
            else if (validate.constructor === Array)
                validate.push(notEmpty);
            else validate = [validate as ValidateFunc, notEmpty]
        }
        else if (validate == null) continue

        let fieldValidationResult = await runValidator(validate, value);
        result.fields[id].message = fieldValidationResult.message;
        result.fields[id].hasError = fieldValidationResult.hasError;
    }
    const formLevelValidation = await runValidator(formConfig.validate, forObject);
    result.hasError = formLevelValidation.hasError || Object.keys(result.fields).reduce((p, k) => p || result.fields[k].hasError, false)
    result.message = formLevelValidation.message
    return result
}

export async function runValidator(validator: ValidateFunc | ValidateFunc[], value): Promise<ValidationResult> {
    if (validator == null)
        return getValidationResult();
    try {
        if (validator.constructor === Array) {
            for (let i = 0; i < validator.length; i++) {
                const v = validator[i];
                let errorMsg = await v(value);
                if (errorMsg) return getValidationResult(errorMsg)
            }
        }
        else if (validator.constructor === Function || validator.constructor === Object.getPrototypeOf(async function() {}).constructor) {
            return getValidationResult(await (validator as AsyncValidateFunc)(value));
        }
    } catch (ex) {
        return getValidationResult('Failed to validate this entry.');
    }
    return getValidationResult();
}

export function getFieldConfigs(form: WebForm): FieldConfigBase[] {
    return Object.keys(form.fieldsConfig).map(k => form.fieldsConfig[k])
}