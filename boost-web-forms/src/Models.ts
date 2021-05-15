import {isEmpty} from "boost-web-core";
import {WebForm} from "./FormService";

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
    onSubmit?: (e) => void
    onValidation?: (e, validationResult: ValidationResult) => void
}

export interface WebFormFieldEvents {
    onInput?: (e) => void
    onChange?: (e) => void
    onFocus?: (e) => void
    onBlur?: (e) => void
    onValidation?: (e, validationResult: ValidationResult) => void
}