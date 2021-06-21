import {h} from 'vdtree'
import {FieldConfig} from "../Models";

export interface AbstractLabelProps {
    field: FieldConfig
    htmlAttrs?: any
}

export function AbstractLabel({field, htmlAttrs}: AbstractLabelProps) {
    if (field.hideLabel)
        return ''
    const label = h('label', {...htmlAttrs, for: field.id})
    if (field.type == 'checkbox' || field.readonly)
        label.props.style = { display: 'inline-block' }
    label.children.push(field.label)
    if (field.required)
        label.children.push(h('span', {style: {color: 'red'}}, '*'))
    if (field.readonly)
        label.children.push(': ')
    return label
}