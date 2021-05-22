import {isEmpty} from "boost-web-core";


export type FieldsConfig = {
    [key: string]: FieldConfigBase;
}

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

export interface WebForm extends Partial<HTMLFormElement> {
    fieldsConfig?: FieldsConfig
    validate?: ValidateFunc | ValidateFunc[],
    scale?: number
    hideLabels?: boolean
    readonly?: boolean
    validationResult?: FormValidationResult
}

export interface ValidationResult {
    errorMessage: string,
    hasError: boolean
}

export interface FormValidationResult extends ValidationResult{
    fields: {
        [key: string]: ValidationResult;
    }
}

export function getValidationResult(errorMessage?: string): ValidationResult {
    return {
        errorMessage: errorMessage ?? '',
        hasError: !isEmpty(errorMessage)
    }
}

export type AsyncValidateFunc = (val, errorMessage?: string) => Promise<string>
export type ValidateFunc = AsyncValidateFunc | ((val, errorMessage?: string) => string)
export type FormValidateFunc = (formData: any) => Promise<string>

export interface WebFormEvents {
    onValidation?: (e, validationResult: ValidationResult) => void
}

export interface WebFormFieldEvents {
    onInput?: (e) => void
    onChange?: (e) => void
    onFocus?: (e) => void
    onBlur?: (e) => void
    onValidation?: (e, validationResult: ValidationResult) => void
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
    renderField(forObject: any, formConfig: WebForm, field: FieldConfigBase): string|HTMLElement
}