import {DeepPartial, Dict, isEmpty, Nullable, OneOrMany} from "boost-web-core";


export type FieldsConfig = Record<string, FieldConfig>

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
    choices: ChoiceItem[]
    variation?: string
    hideLabel: boolean
    scale: number
    readonly: boolean
    validate?: OneOrMany<ValidateFunc>
    group?: string
}

export interface FormConfig extends Partial<HTMLFormElement> {
    fields: FieldsConfig
    validate?: OneOrMany<FormValidateFunc>
    scale?: number
    hideLabels?: boolean
    readonly?: boolean
    validationResult?: FormValidationResult
    /**
     * Do not include a default submit button
     */
    excludeSubmitButton?: boolean
    /**
     * If true, should render a <div> or similar panel instead of a <formConfig>
     */
    excludeFormTag?: boolean
    /**
     * Whether the config is created from createFormConfig() call.
     */
    $$isComplete?: boolean
    /**
     * Whether values in forObject are updated up on user input.
     */
    syncValues?: boolean
    /**
     * Whether to validate the form automatically up on submission.
     */
    autoValidate?: boolean,
    /**
     * List of field ids to skip
     */
    skip?: string[]
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
    'isbn' | 'location' | 'language' | 'money' | 'timezone' | 'title' | 'rating' | 'sourcecode' | 'age' |
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

export const SimpleTextTypes : FormFieldType[] = [
    'text', 'password', 'date', 'datetime-local', 'email', 'search', 'url', 'time', 'month', 'week', 'tel'
]

export interface ChoiceItem {
    key: any
    val: string
}

export type PartialFieldConfig = Omit<Partial<FieldConfig>, 'choices'> & {
    choices?: string[] | Record<string, string> | ChoiceItem[]
}
export type PartialFormConfig = Omit<Partial<FormConfig>, 'fields'> & {
    fields?: Record<string, PartialFieldConfig>
}