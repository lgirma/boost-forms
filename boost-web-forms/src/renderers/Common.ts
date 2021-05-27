import { FormValidationResult, FormFieldType, FieldConfig, WebForm } from "../Models";
import {
    AbstractDomElement,
    AbstractDomNode,
    OneOrMany
} from "boost-web-core";

export interface LayoutRenderer {
    label: (field: FieldConfig, attrs?: any) => OneOrMany<AbstractDomNode>,
    input: (val: any, field: FieldConfig, attrs?: any) => OneOrMany<AbstractDomNode>,
    form: (form: WebForm, attrs?: any, rootTag?: string) => AbstractDomElement
}
export interface FormLayout {
    formLayout(forObject: any, form: WebForm, renderer: LayoutRenderer, validationResult?: FormValidationResult): AbstractDomElement
}

export interface PluginOptions {
    columns: number
    isInline?: boolean
    isHorizontal?: boolean
}

export interface RenderFormOptions {
    labelAttrs?: (fieldConfig: FieldConfig) => {}
    inputAttrs?: (fieldConfig: FieldConfig) => {}
    fieldSetAttrs?: (fieldConfig: FieldConfig) => {}

    excludeFormTag?: boolean
    layout?: FormLayout
}

export function getHtmlAttrs(field: FieldConfig) {
    const src: Partial<FieldConfig> = {
        name: field.id,
        ...field,
        icon: undefined,
        type: undefined,
        helpText: undefined,
        label: undefined,
        validationResult: undefined,
        customOptions: undefined,
        maxlength: undefined,
        multiple: undefined,
        choices: undefined,
        variation: undefined,
        hideLabel: undefined,
        scale: undefined,
        readonly: undefined,
        validate: undefined,
        onValidation: undefined
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
    const src: Partial<WebForm> = {
        ...form,
        fieldsConfig: undefined,
        validate: undefined,
        scale: undefined,
        hideLabels: undefined,
        excludeSubmitButton: undefined,
        readonly: undefined,
        validationResult: undefined,
        onValidation: undefined,
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