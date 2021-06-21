import { FormValidationResult, FormFieldType, FieldConfig, FormConfig } from "../Models";
import { OneOrMany } from "boost-web-core";
import {AbstractDomElement, AbstractDomNode} from "vdtree";

export interface LayoutRenderer {
    label: (field: FieldConfig, attrs?: any) => OneOrMany<AbstractDomNode>,
    input: (val: any, field: FieldConfig, attrs?: any) => OneOrMany<AbstractDomNode>,
    form: (form: FormConfig, attrs?: any, rootTag?: string) => AbstractDomElement
}
export interface FormLayout {
    formLayout(forObject: any, form: FormConfig, renderer: LayoutRenderer, validationResult?: FormValidationResult): AbstractDomElement
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
        group: undefined,
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
        if (val != null && val != '')
            result[k] = val
    }
    return result
}

export function getHtmlFormAttrs(form: FormConfig) {
    const src: Partial<FormConfig> = {
        ...form,
        fieldsConfig: undefined,
        validate: undefined,
        scale: undefined,
        hideLabels: undefined,
        excludeSubmitButton: undefined,
        readonly: undefined,
        validationResult: undefined,
        onValidation: undefined,
        excludeFormTag: undefined
    }
    let result : any = {}
    for (const [key, val] of Object.entries(src)) {
        if (val != null && val != '')
            result[key] = val
    }
    return result
}

export const SimpleTextTypes : FormFieldType[] = [
    'text', 'password', 'date', 'datetime-local', 'email', 'search', 'url', 'time', 'month', 'week', 'tel'
]