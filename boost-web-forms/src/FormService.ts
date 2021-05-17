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
    'radio' | 'html' | 'color' | 'datetime-local' | 'month' | 'range' | 'reset' | 'tel' | 'url' | 'week' |
    'multiselect-checkbox' | 'composite';

export interface FormConfigBase {
    validate?: ValidateFunc | ValidateFunc[],
    scale?: number
    id?: string
    readonly?: boolean
    showLabel?: boolean
}

export interface FieldConfigBase extends FormConfigBase {
    icon?: string
    type?: FormFieldType
    required?: boolean
    helpText?: string
    label?: string
    placeholder?: string
    validationResult?: ValidationResult
    customOptions?: any,
    step?: number
    pattern?: string
    min?: number
    max?: number
    maxlength?: number
    disabled?: boolean
    hidden?: boolean
    multiple?: boolean
    choices?: string[] | {[k: string]: string}
}

export type FieldsConfig = {
    [key: string]: FieldConfigBase;
}

export interface WebForm extends FormConfigBase {
    columns?: number
    fieldsConfig?: FieldsConfig
}

export function createFormConfig(forObject, config: WebForm = {}): WebForm {
    config.fieldsConfig = {
        ...Object.keys(forObject).reduce((a, b) => ({...a, [b]: null}), {}),
        ...config.fieldsConfig
    }
    config.scale ??= 1;
    config.readonly ??= false;
    config.showLabel ??= true;
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
            showLabel: config.showLabel,
            icon: null,
            helpText: '',
            validationResult: {
                errorMessage: '',
                hasError: false
            },
            id: fieldId,
            required: false,
            placeholder: '',
            label: humanize(fieldId),
            step: null,
            pattern: '',
            min: null,
            max: null,
            maxlength: null,
            disabled: false,
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
    if (fieldId.toLowerCase().endsWith('password'))
        return 'password';
    if (fieldId.toLowerCase().endsWith('email'))
        return 'email';
    if (fieldId.toLowerCase().endsWith('name'))
        return 'text';
    if (fieldId.toLowerCase().endsWith('quantity') || fieldId.toLowerCase().endsWith('amount'))
        return 'number';
    if (fieldId.toLowerCase().endsWith('date') || fieldId.toLowerCase().indexOf('date') == 0)
        return 'date';
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