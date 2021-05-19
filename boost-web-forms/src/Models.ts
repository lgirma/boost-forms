import {isEmpty} from "boost-web-core";
import {FieldConfigBase, WebForm} from "./FormService";

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

export type FormFieldType =  HTMLInputType | 'name' | 'files' | 'select' | 'autocomplete' |
    'toggle' | 'number' | 'textarea' | 'markdown' | 'reCaptcha' | 'html' | 'year' |
    'multiselect-checkbox' | 'composite' | 'version' | 'avatar' | 'city' | 'country' | 'ipv4' | 'ipv6' | 'guid' |
    'isbn' | 'location' | 'language' | 'money' | 'timezone' | 'title' | 'gallery';

export interface CustomFieldRenderer {
    forType: string|string[]
    id?: string
    renderField(forObject: any, formConfig: WebForm, field: FieldConfigBase): string|HTMLElement
}