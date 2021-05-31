import {
    humanize,
    uuid,
    isDate,
    isDateTime,
    isYear,
    isTime,
    DeepPartial,
    isEmpty,
    isArray,
    isFunc, toArray, Dict, toArrayWithoutNulls
} from 'boost-web-core';
import {
    FormValidationResult,
    ValidationResult,
    ValidateFunc,
    getValidationResult,
    AsyncValidateFunc,
    CustomFieldRenderer,
    FormFieldType,
    FieldConfig, FormConfig, VALID_FORM
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
            : cfr.forType.indexOf(forType) > -1) ?? null
}

export function field(value: FieldConfig) {
    console.log('value:', value)
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        console.log(target, propertyKey, descriptor)
    };
}

export function createFormConfig(forObject: any, _config: DeepPartial<FormConfig> = {}): FormConfig {
    let config: FormConfig = {
        scale: 1,
        readonly: false,
        hideLabels: false,
        excludeSubmitButton: false,
        ..._config,
        fieldsConfig: {
            ...Object.keys(forObject).reduce((a, fieldId) => ({...a, [fieldId]: null}), {}),
            ..._config.fieldsConfig
        },
    }

    if (!config.excludeSubmitButton) {
        config.fieldsConfig['$$submit'] = {
            ...getDefaultFieldConfig('$$submit', 'submit', config),
            hideLabel: true,
            label: 'Submit',
            type: 'submit'
        }
    }

    Object.entries(forObject).forEach(_ => {
        let [fieldId, fieldValue] = _;

        let type = config.fieldsConfig[fieldId]?.type ?? guessType(fieldId, fieldValue)

        config.fieldsConfig[fieldId] = {
            ...getDefaultFieldConfig(fieldId, type, config),
            ...guessConfig(config.fieldsConfig[fieldId], fieldValue, type),
            ...config.fieldsConfig[fieldId],
        }
        if (isEmpty(config.fieldsConfig[fieldId].label))
            config.fieldsConfig[fieldId].label = humanize(fieldId)
        config.fieldsConfig[fieldId].choices = (config.fieldsConfig[fieldId]?.choices == null
            ? {}
            : (config.fieldsConfig[fieldId].choices?.constructor === Array
                ? (config.fieldsConfig[fieldId].choices as string[]).reduce((acc, b)=> ({...acc, [b]: b}), {})
                : config.fieldsConfig[fieldId].choices))
    });

    return config;
}

export function getDefaultFieldConfig(fieldId: string, type: FormFieldType, formConfig: Partial<FormConfig>): FieldConfig {
    return {
        scale: formConfig.scale ?? 1,
        readonly: formConfig.readonly ?? false,
        hideLabel: formConfig.hideLabels ?? false,
        colSpan: 1,
        icon: '',
        helpText: '',
        validationResult: {
            message: '',
            hasError: false
        },
        id: fieldId,
        multiple: false,
        type: type,
        label: '',
        choices: []
    }
}

export function guessType(fieldId: string, fieldValue: any): FormFieldType {
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

export function guessConfig(fieldConfig: Partial<FieldConfig>, val: any, fieldType: FormFieldType) : Partial<FieldConfig> {
    let result: Partial<FieldConfig> = {}
    fieldConfig ??= {}
    if (val != null && val.constructor === Array && fieldType == 'radio') {
        result.choices = val.reduce((acc, el) => ({...acc, [el]: humanize(el)}), {})
        result.multiple = true
    }
    if (fieldType == 'password')
        result.required = true
    return result
}

interface FormValidationModel {
    formValidationResult: ValidationResult|Promise<ValidationResult>|null
    fields: Dict<ValidationResult|Promise<ValidationResult>>
}

function mergeValidationResults(results: ValidationResult[]): ValidationResult {
    return results.reduce(
        (prev, curr) => ({hasError: curr.hasError || prev.hasError, message: !isEmpty(curr.message) ? curr.message : prev.message}),
        getValidationResult())
}

export function validateForm(forObject: any, _formConfig?: FormConfig) : FormValidationResult {
    const m = validateFormInternal(forObject, _formConfig)
    const formVR = m.formValidationResult as ValidationResult
    let result: FormValidationResult = {
        message: formVR.message,
        hasError: formVR.hasError,
        fields: {...(m.fields as Dict<ValidationResult>)}
    }

    let anyOfFieldsHasError = Object.keys(result.fields).reduce((p, k) => p || result.fields[k].hasError, false)
    result.hasError ||= anyOfFieldsHasError

    return result
}

export async function validateFormAsync(forObject: any, _formConfig?: FormConfig) : Promise<FormValidationResult> {
    const m = validateFormInternal(forObject, _formConfig)
    const formVR = await (m.formValidationResult as Promise<ValidationResult>)
    let result: FormValidationResult = {
        message: formVR.message,
        hasError: formVR.hasError,
        fields: {}
    }

    for (const [k, valPromise] of Object.entries(m.fields)) {
        const vr = await (valPromise as Promise<ValidationResult>)
        result.fields[k] = vr
        result.hasError ||= vr.hasError
    }

    return result
}

function validateFormInternal(forObject: any, _formConfig?: FormConfig) : FormValidationModel {
    let formConfig = createFormConfig(forObject, _formConfig)
    let fieldsConfig = formConfig.fieldsConfig;
    let result: FormValidationModel = {fields: {}, formValidationResult: null};
    for (const [id, value] of Object.entries(forObject)) {
        const config = fieldsConfig[id]
        result.fields[id] = getValidationResult()
        if (config == null) continue
        let validators = toArray(config.validate)
        if (config.required)
            validators.push(notEmpty);
        else if (validators.length == 0) continue
        result.fields[id] = runValidator(validators, value);
    }
    result.formValidationResult = formConfig.validate
        ? runValidator(formConfig.validate, forObject)
        : getValidationResult();
    return result
}

export function runValidator(validator: ValidateFunc | ValidateFunc[], value: any): ValidationResult|Promise<ValidationResult> {
    if (validator == null)
        return getValidationResult();
    try {
        const validators: ValidateFunc[] = toArray(validator)
        let asyncVRs: Promise<ValidationResult>[] = []
        for (let i = 0; i < validators.length; i++) {
            const v: ValidateFunc = validators[i];
            if (v == null) continue
            let vResult = v(value)
            if (vResult == null)
                continue
            if (typeof(vResult) === 'string') {
                if (!isEmpty(vResult))
                    return getValidationResult(vResult)
                continue
            }
            asyncVRs.push((vResult as Promise<string>)
                .then(errMsg => getValidationResult(errMsg))
                .catch(err => {
                    console.warn('Error while attempting to validate', err)
                    return getValidationResult('Failed to validate this entry.')
                }))
        }
        if (asyncVRs.length) {
            return Promise.all(asyncVRs).then(vrs => mergeValidationResults(vrs))
        }
    } catch (ex) {
        return getValidationResult('Failed to validate this entry.');
    }
    return getValidationResult()
}

export function getFieldConfigs(form: FormConfig): FieldConfig[] {
    return Object.keys(form.fieldsConfig).map(k => form.fieldsConfig[k])
}