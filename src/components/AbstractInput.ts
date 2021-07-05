import {AbstractDomNode, h, withState} from "vdtree";
import {FieldConfig, getValidationResult, ValidationResult} from "../Models";
import {SimpleTextTypes} from "../renderers/Common";
import {AbstractRating} from "./AbstractRating";
import {DefaultFormLayout} from "./DefaultFormLayout";
import {OneOrMany} from "boost-web-core";
import {createFormConfig, getFieldHtmlAttrs} from "../FormService";

export interface AbstractInputProps {
    field: FieldConfig
    value: any
    htmlAttrs?: any
    validationResult?: ValidationResult
}

export function AbstractInput({field, htmlAttrs, value, validationResult}: AbstractInputProps): OneOrMany<AbstractDomNode> {
    validationResult ??= getValidationResult()
    if (field.readonly) {
        if (field.type == 'checkbox')
            return value ? 'Yes' : 'No'
        else if (field.type == 'sourcecode') {
            return h('pre', {}, value)
        }
        else if (field.type == 'markdown') {
            return h('div', {}, value)
        }
        else if (field.type == 'select' || field.type == 'radio') {
            return h('div', {}, field.choices[value])
        }
        return `${value == null ? '' : value}`
    }

    const eltAttrs = {
        ...getFieldHtmlAttrs(field),
        ...htmlAttrs
    }

    if (validationResult.hasError) {
        eltAttrs.style ??= {}
        eltAttrs.style.border = '1px solid red'
    }

    if (field.type == 'textarea') {
        return h('textarea', {rows: 3, ...eltAttrs}, value||'')
    }
    if (field.type == 'submit') {
        return h('input', {type: 'submit', value: field.label ?? 'Submit', ...eltAttrs})
    }
    if (field.type == 'checkbox') {
        return h('input', {type: 'checkbox', checked: !!value, ...eltAttrs})
    }
    if (field.type == 'toggle') {
        return h('input', {type: 'checkbox', checked: value != null, value: field.choices[0], ...eltAttrs})
    }
    if (field.type == 'select') {
        return h('select', {...eltAttrs},
            ...(field.required ? [] : [h('option', {value: ''}, field.placeholder ?? '')]),
            ...Object.keys(field.choices as {})
                .map(k => h('option', {value: k, selected: k == `${value}` ? true : undefined}, field.choices[k]))
        )
    }
    if (field.type == 'radio') {
        return Object.keys(field.choices as {})
            .map(k => h('input', {
                ...eltAttrs,
                id: undefined,
                type: (field.multiple ? 'checkbox' : 'radio'),
                value: `${k}`,
                checked: (field.multiple ? (value as any[]).indexOf(k) > -1 : k == value) ? true : undefined}))

    }
    if (field.type == 'files')
        return h('input', {...eltAttrs, type: 'file', multiple: 'multiple', files: value})
    if (field.type == 'file')
        return h('input', {...eltAttrs, type: 'file', files: value})
    if (field.type == 'number')
        return h('input', {...eltAttrs, type: 'number', value: `${value == null ? '' : value}`})
    if (field.type == 'name')
        return h('input', {...eltAttrs, type: 'text', value: `${value == null ? '' : value}`})
    if (field.type == 'range')
        return h('input', {...eltAttrs, type: 'range', value: `${value == null ? '' : value}`})
    if (field.type == 'money')
        return h('input', {min: '0', step: '0.01', ...eltAttrs, type: 'number', value: `${value == null ? '' : value}`})
    if (field.type == 'rating')
        return AbstractRating({value, inputAttrs: eltAttrs, max: 5, field}) as any
    /*if (field.type == 'markdown')
        return MarkdownInput(value, eltAttrs, {renderer: src => src})
    if (field.type == 'sourcecode')
        return SourceCodeInput(value, eltAttrs, {renderer: src => src})*/
    if (field.type == 'composite') {
        return h('div', {style: {margin: '5px', border: '1px solid gray', padding: '2px'}},
            DefaultFormLayout({
                forObject: value,
                formConfig: createFormConfig(value, {excludeSubmitButton: true, excludeFormTag: true, ...field.customOptions})
            }))
    }
    if (SimpleTextTypes.indexOf(field.type) > -1)
        return h('input', {...eltAttrs, type: field.type, value: `${value == null ? '' : value}`})
    console.warn(`Unsupported field type: '${field.type}' for field '${field.id}'.`)
    return ''
}