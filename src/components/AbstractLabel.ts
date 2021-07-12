import {AbstractDomNode, h} from 'vdtree'
import {FieldConfig, getValidationResult, ValidationResult} from "../Models";

export interface AbstractLabelProps {
    field: FieldConfig
    htmlAttrs?: any
    validationResult?: ValidationResult
}

export function AbstractLabel({field, htmlAttrs = {}, validationResult}: AbstractLabelProps): AbstractDomNode {
    validationResult ??= getValidationResult()
    if (field.hideLabel)
        return ''
    if (validationResult.hasError && (field.type == 'checkbox' || field.type == 'radio')) {
        htmlAttrs.style ??= {}
        htmlAttrs.style.color = 'red'
    }
    if (field.type == 'checkbox' || field.readonly){
        htmlAttrs.style ??= {}
        htmlAttrs.style.display = 'inline-block'
    }
    const label = h('label', {...htmlAttrs, for: field.id})
    label.children.push(field.label)
    if (field.required)
        label.children.push(h('span', {style: {color: 'red'}}, '*'))
    if (field.readonly)
        label.children.push(': ')
    return label
}