import {FieldConfigBase, FormFieldType} from "../FormService";
import {ValidateFunc, ValidationResult, WebFormEvents, WebFormFieldEvents} from "../Models";

export interface RenderFormOptions extends WebFormEvents, WebFormFieldEvents {
    labelAttrs?: (fieldConfig: FieldConfigBase) => {}
    inputAttrs?: (fieldConfig: FieldConfigBase) => {}
    fieldSetAttrs?: (fieldConfig: FieldConfigBase) => {}

    excludeFormTag?: boolean
    excludeSubmitButton?: boolean
    layout?: string
}

export function getHtmlAttrs(field: FieldConfigBase) {
    const src: FieldConfigBase = {
        name: field.id,
        ...field,
        icon: null,
        type: null,
        helpText: null,
        label: null,
        validationResult: null,
        customOptions: null,
        maxlength: null,
        multiple: null,
        choices: null,
        variation: null,
        hideLabel: null,
        scale: null,
        readonly: null,
        validate: null,
    }
    let result : any = {
        name: field.id
    }
    for (const [k, val] of Object.entries(src)) {
        if (val != null && val != '') {
            if (k == 'disabled') {
                if (val) result.disabled = true
            }
            else if (k == 'hidden') {
                if (val) result.hidden = true
            }
            else if (k == 'required') {
                if (val) result.required = true
            }
            else
                result[k] = val
        }
    }
    return result
}