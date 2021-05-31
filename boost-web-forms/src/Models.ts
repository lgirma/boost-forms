import {DeepPartial, Dict, isEmpty, OneOrMany} from "boost-web-core";


export type FieldsConfig = Dict<FieldConfig>

export interface FieldConfig extends Partial<HTMLInputElement>, WebFormFieldEvents {
    id: string
    icon?: string
    type: FormFieldType
    colSpan: number
    helpText?: string
    label: string
    validationResult?: ValidationResult
    customOptions?: any,
    maxlength?: string
    multiple?: boolean
    choices: string[] | Dict<string>
    variation?: string
    hideLabel: boolean
    scale: number
    readonly: boolean
    validate?: OneOrMany<ValidateFunc>
}

export interface FormConfig extends DeepPartial<HTMLFormElement>, WebFormEvents {
    fieldsConfig: FieldsConfig
    validate?: OneOrMany<ValidateFunc>
    scale?: number
    hideLabels?: boolean
    readonly?: boolean
    validationResult?: FormValidationResult
    excludeSubmitButton?: boolean
}

export interface ValidationResult {
    message?: string,
    hasError: boolean
}

export interface FormValidationResult extends ValidationResult{
    fields: {
        [key: string]: ValidationResult;
    }
}

export function getValidationResult(errorMessage?: string): ValidationResult {
    return {
        message: errorMessage ?? '',
        hasError: !isEmpty(errorMessage ?? null)
    }
}

export const VALID_FORM: FormValidationResult = {message: '', hasError: false, fields: {}}

export type AsyncValidateFunc = (val: any, errorMessage?: string) => Promise<string>
export type ValidateFunc = AsyncValidateFunc | ((val: any, errorMessage?: string) => string)
export type FormValidateFunc = (formData: any) => Promise<string>

export interface WebFormEvents {
    onValidation?: (e: Event, validationResult: FormValidationResult) => void
}

export interface WebFormFieldEvents {
    onValidation?: (e: Event, validationResult: ValidationResult) => void
}

export type HTMLInputType =
    'button' |
    'checkbox' |
    'color' |
    'date' |
    'datetime-local' |
    'email' |
    'file' |
    'hidden' |
    'image' |
    'month' |
    'number' |
    'password' |
    'radio' |
    'range' |
    'reset' |
    'search' |
    'submit' |
    'tel' |
    'text' |
    'time' |
    'url' |
    'week';

export type FormFieldType =  HTMLInputType | 'name' | 'files' | 'select' |
    'toggle' | 'number' | 'textarea' | 'markdown' | 'reCaptcha' | 'html' | 'year' |
    'multiselect-checkbox' | 'composite' | 'version' | 'avatar' | 'city' | 'country' | 'ipv4' | 'ipv6' | 'guid' |
    'isbn' | 'location' | 'language' | 'money' | 'timezone' | 'title' |
    /**
     * Where use uploads one or more preview-able images
     */
    'gallery' |
    /**
     * where new items can be added or removed
     */
    'list' |
    /**
     * Choice of one or more items fetched from a paged data source
     */
    'autocomplete';

export interface CustomFieldRenderer {
    forType: string|string[]
    id?: string
    renderField(forObject: any, formConfig: FormConfig, field: FieldConfig): string|HTMLElement
}