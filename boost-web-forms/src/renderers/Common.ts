import {
    FormValidationResult, ValidateFunc, ValidationResult, WebFormEvents, WebFormFieldEvents, FormFieldType,
    FieldConfigBase, FieldsConfig, WebForm
} from "../Models";
import {renderInput, renderLabel} from "./VanillaFormRenderer";
import {AbstractDomElement, DomElementChildren, DomElementChildrenFrom} from "boost-web-core";

export interface LayoutRenderer {
    label: (field: FieldConfigBase, attrs?: any) => DomElementChildrenFrom,
    input: (val: any, field: FieldConfigBase, attrs?: any) => DomElementChildrenFrom,
    //fields: () => DomElementChildrenFrom
}
export interface FormLayout {
    //renderForm(renderer: LayoutRenderer, form?: WebForm, forObject?): DomElementChildrenFrom
    renderForm(forObject, form: WebForm, renderer: LayoutRenderer): DomElementChildrenFrom
}

export interface PluginOptions {
    columns?: number
    inline?: boolean
    horizontal?: boolean
}

export interface RenderFormOptions extends WebFormEvents, WebFormFieldEvents {
    labelAttrs?: (fieldConfig: FieldConfigBase) => {}
    inputAttrs?: (fieldConfig: FieldConfigBase) => {}
    fieldSetAttrs?: (fieldConfig: FieldConfigBase) => {}
    submitAttrs?: (forObject, options: WebForm) => {}

    excludeFormTag?: boolean
    excludeSubmitButton?: boolean
    layout?: FormLayout
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

export function getHtmlFormAttrs(form: WebForm) {
    const src: WebForm = {
        ...form,
        fieldsConfig: null,
        validate: null,
        scale: null,
        hideLabels: null,
        readonly: null,
        validationResult: null
    }
    let result : any = {}
    for (const [key, val] of Object.entries(src)) {
        if (val != null && val != '') {
            if (key == 'disabled') {
                if (val) result.disabled = true
            }
            else if (key == 'hidden') {
                if (val) result.hidden = true
            }
            else
                result[key] = val
        }
    }
    return result
}

export const SimpleTextTypes : FormFieldType[] = [
    'text', 'name', 'password', 'date', 'datetime-local', 'email', 'search', 'url', 'time', 'month', 'week', 'tel'
]