import {humanize, isDate} from 'boost-web-core';
import {
    FormValidationResult,
    ValidationResult,
    ValidateFunc,
    getValidationResult,
    AsyncValidateFunc
} from "./Models";
import {notEmpty} from './Validation';


export type FormFieldType = 'text' | 'email' | 'password' | 'file' | 'files' | 'select' | 'autocomplete' |
    'checkbox' | 'toggle' | 'number' | 'date' | 'time' | 'textarea' | 'markdown' | 'reCaptcha' |
    'radio' | 'html' | 'color' | 'datetime-local' | 'month' | 'year' | 'range' | 'reset' | 'tel' | 'url' | 'week' |
    'multiselect-checkbox' | 'composite' | 'version' | 'avatar' | 'city' | 'country' | 'ipv4' | 'ipv6' | 'guid' |
    'isbn' | 'location' | 'language' | 'money' | 'timezone' | 'title' | 'gallery' | 'submit';

/*export interface FormConfigBase extends Partial<HTMLElement> {
    validate?: ValidateFunc | ValidateFunc[],
    scale?: number
    hideLabels?: boolean
    readonly?: boolean
    id?: string
}*/

export interface FieldConfigBase extends Partial<HTMLInputElement> {
    icon?: string
    type?: FormFieldType
    helpText?: string
    label?: string
    validationResult?: ValidationResult
    customOptions?: any,
    maxlength?: string
    multiple?: boolean
    choices?: string[] | {[k: string]: string}
    variation?: string
    hideLabel?: boolean
    scale?: number
    readonly?: boolean
    validate?: ValidateFunc | ValidateFunc[]

    //disabled?: boolean
    //hidden?: boolean
    //step?: string
    //pattern?: string
    //min?: string
    //max?: string
    //required?: boolean
    //placeholder?: string
}

export type FieldsConfig = {
    [key: string]: FieldConfigBase;
}

export interface WebForm extends Partial<HTMLFormElement> {
    columns?: number
    fieldsConfig?: FieldsConfig
    validate?: ValidateFunc | ValidateFunc[],
    scale?: number
    hideLabels?: boolean
    readonly?: boolean
    validationResult?: FormValidationResult
}

export function createFormConfig(forObject, config: WebForm = {}): WebForm {
    config.fieldsConfig = {
        ...Object.keys(forObject).reduce((a, b) => ({...a, [b]: null}), {}),
        ...config.fieldsConfig
    }
    config.scale ??= 1;
    config.readonly ??= false;
    config.hideLabels ??= false;
    config.columns ??= 1;
    if (config.columns < 1)
        config.columns = 1;

    Object.keys(forObject).forEach(_ => {
        let fieldId = _;
        let fieldValue = forObject[fieldId];

        let type = config.fieldsConfig[fieldId]?.type ?? guessType(fieldId, fieldValue)

        config.fieldsConfig[fieldId] = {
            scale: config.scale,
            readonly: config.readonly,
            hideLabel: config.hideLabels,
            icon: null,
            helpText: '',
            validationResult: {
                errorMessage: '',
                hasError: false
            },
            id: fieldId,
            label: humanize(fieldId),
            // required: false,
            // placeholder: '',
            // step: null,
            // pattern: '',
            // min: null,
            // max: null,
            // maxlength: null,
            // disabled: false,
            multiple: false,
            type: type,
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

export function guessType(fieldId, fieldValue): FormFieldType {
    let table = {
        'password$': 'password',
        'email$': 'email',
        'name$': 'name',
        'quantity$|number$': 'number',
        '^amount|amount$': 'money',
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
        if (isDate(fieldValue))
            return 'date';
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
    formConfig = formConfig || createFormConfig(forObject)
    let fieldsConfig = formConfig.fieldsConfig;
    let result: FormValidationResult = {
        hasError: false,
        errorMessage: '',
        fields: {}
    };
    for (const id in forObject) {
        if (!forObject.hasOwnProperty(id))
            continue;
        const config = fieldsConfig[id]
        result.fields[id] = {
            hasError: false,
            errorMessage: null
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
        result.fields[id].errorMessage = fieldValidationResult.errorMessage;
        result.fields[id].hasError = fieldValidationResult.hasError;
    }
    const formLevelValidation = await runValidator(formConfig.validate, forObject);
    result.hasError = formLevelValidation.hasError || Object.keys(result.fields).reduce((p, k) => p || result.fields[k].hasError, false)
    result.errorMessage = formLevelValidation.errorMessage
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