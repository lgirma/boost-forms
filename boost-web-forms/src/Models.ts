import {DeepPartial, Dict, isEmpty, Nullable, OneOrMany} from "boost-web-core";


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
    group?: string
}

export interface FormConfig extends DeepPartial<HTMLFormElement>, WebFormEvents {
    fieldsConfig: FieldsConfig
    validate?: OneOrMany<FormValidateFunc>
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

export function getFormValidationResult(errorMessage?: Nullable<string>, fields?: Dict<ValidationResult>): FormValidationResult {
    return {
        message: errorMessage ?? '',
        hasError: !isEmpty(errorMessage ?? null) ||
            (fields != null && Object.keys(fields).find(k => fields[k].hasError) != null),
        fields: {...fields}
    }
}

type ValidationFunc<T> = (val: any, errorMessage?: string) => T
export type AsyncValidateFunc = ValidationFunc<Promise<string>>
export type SyncValidateFunc = ValidationFunc<string>
export type ValidateFunc = Nullable<SyncValidateFunc | AsyncValidateFunc>
export type FormValidateFunc = Nullable<ValidationFunc<Promise<string> | string | Dict<string> | Promise<Dict<string>>>>

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
    'toggle' | 'textarea' | 'markdown' | 'reCaptcha' | 'year' |
    'multiselect-checkbox' | 'composite' | 'version' | 'avatar' | 'city' | 'country' | 'ipv4' | 'ipv6' | 'guid' |
    'isbn' | 'location' | 'language' | 'money' | 'timezone' | 'title' | 'rating' | 'sourcecode' |
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