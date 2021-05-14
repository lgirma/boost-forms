import {humanize, isEmpty} from 'boost-web-core';
import {
    FormValidationResult,
    ValidationResult,
    ValidateFunc,
    getValidationResult,
    AsyncValidateFunc
} from "./Models";
import {notEmpty} from './Validation';


export type FormFieldType = 'text' | 'email' | 'password' | 'file' | 'select' | 'autocomplete' |
    'checkbox' | 'number' | 'date' | 'datetime' | 'time' | 'textarea' | 'markdown' | 'reCaptcha';

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
    customOptions?: any
}

export type FieldsConfig = {
    [key: string]: FieldConfigBase;
}

export interface WebForm extends FormConfigBase {
    columns?: number
    fieldsConfig?: FieldsConfig
}

export function createForm(forObject, config: WebForm = {}): WebForm {
    config.fieldsConfig ??= {};
    config.scale ??= 1;
    config.readonly ??= false;
    config.showLabel ??= true;
    config.columns ??= 1;
    if (config.columns < 1)
        config.columns = 1;

    Object.keys(forObject).forEach(_ => {
        let fieldId = _;
        let fieldValue = forObject[fieldId];

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
            placeholder: null,
            label: humanize(fieldId),
            ...config.fieldsConfig[fieldId]
        }
        if (config.fieldsConfig[fieldId].type == null)
            config.fieldsConfig[fieldId].type = this.guessType(fieldId, fieldValue);
    });

    return config;
}

export function guessType(fieldId, fieldValue): FormFieldType {
    if (fieldId === 'password')
        return 'password';
    if (fieldId === 'email')
        return 'email';
    if (fieldId === 'name')
        return 'text';
    if (fieldValue == null)
        return 'text';

    const jsType = typeof(fieldValue);

    if (jsType === 'boolean')
        return 'checkbox';
    if (jsType === 'string')
        return 'text';
    if (jsType === 'number')
        return 'number';

    return 'text';
}

export async function validateForm(forObject, formConfig: WebForm) : Promise<FormValidationResult> {
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