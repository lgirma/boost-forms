import {FieldConfig, FormConfig, PartialFormConfig, SimpleTextTypes} from "./Models";
import {createFormConfig, getFieldHtmlAttrs, getFields, getFormHtmlAttrs, validateForm} from "./FormService";
import {isEmpty} from "boost-web-core";
import {ratingInput} from "./RatingInput";

export function renderForm(forObj: any, formConfig?: FormConfig | PartialFormConfig) {
    const form = formConfig?.$$isComplete ? (formConfig as FormConfig) : createFormConfig(forObj, formConfig || {})
    return `<form ${props(getFormHtmlAttrs(form))}>${getFields(form).map(f => renderField(f, forObj[f.id])).join('')}</form>`
}

function prop(key: string, val?: any, condition = true) {
    if (!condition) return ''
    return ` ${key}="${val}"`
}

function props(dict: Record<string, any>) {
    return Object.keys(dict || {}).map(k => prop(k, dict[k])).join(' ')
}

function flag(key: string, condition = true) {
    if (!condition) return ''
    return ` ${key}`
}

export function renderField(f: FieldConfig, value: any) {
    return '<div>'
        + renderLabel(f)
        + (f.readonly ? renderReadOnlyValue(f, value) : renderInput(f, value))
        + (isEmpty(f.helpText) && !f.validationResult?.hasError ? '' : `<div><small>${f.helpText}</small></div>`)
        + (f.validationResult?.hasError ? `<div style="color: red;"><small>${f.validationResult.message}</small></div>` : '')
        + '</div>'
}

export function renderLabel(f: FieldConfig) {
    if (['checkbox', 'submit'].indexOf(f.type) > -1)
        return ''
    return `<label for="${f.id}">${f.label}</label>`
}

export function renderInput(f: FieldConfig, value: any) {
    let type = f.type
    if (['age', 'money'].indexOf(type) > -1)
        type = 'number'
    if (SimpleTextTypes.indexOf(type) > -1 || ['name', 'submit', 'range', 'number'].indexOf(type) > -1)
        return `<input ${props(getFieldHtmlAttrs(f))} value="${value ?? ''}" type="${type}">`
    else if (type === 'select' && !f.multiple)
        return `<select ${props(getFieldHtmlAttrs(f))}>
                ${!isEmpty(f.placeholder) ? `<option>${f.placeholder}</option>` : ''}
                ${f.choices.map(c => `<option value="${c.key}" ${flag('selected', value == c.key)}>${c.val}</option>`)}
            </select>`
    else if (['textarea', 'sourcecode', 'markdown'].indexOf(type) > -1)
        return `<textarea ${props(getFieldHtmlAttrs(f))} rows="3">${value ?? ''}</textarea>`
    else if (type === 'rating')
        return ratingInput(f, value)
    else if (type === 'checkbox')
        return `<label><input ${props(getFieldHtmlAttrs(f))} type="checkbox" ${flag('checked', !!value)}> ${f.label}</label>`
    else if (type === 'radio' && !f.multiple)
        return f.choices
            .filter(c => c.val != null && c.val != '')
            .map(c => `<label><input type="radio" value="${c.key}" name="${f.name ?? f.id}" ${flag('checked', c.key == value)}> ${c.val}</label>`)
            .join('')
    else if (f.multiple && (type === 'radio' || type === 'select'))
        return f.choices
            .filter(c => c.val != null && c.val != '')
            .map(c => `<label><input ${props(getFieldHtmlAttrs(f))} value="${c.key}" type="checkbox" ${flag('checked', value.indexOf(c.key) > -1)}> ${c.val}</label>`)
            .join('')
    return ''
}

export function renderReadOnlyValue(f: FieldConfig, value: any) {
    let type = f.type
    if (['age', 'money', 'rating'].indexOf(type) > -1)
        type = 'number'
    if (SimpleTextTypes.indexOf(type) > -1 || ['name', 'submit', 'range', 'number'].indexOf(type) > -1)
        return `${value ?? ''}`
    else if (type === 'select' && !f.multiple)
        return f.choices.find(c => c.key == value)?.key ?? ''
    else if (['textarea', 'sourcecode', 'markdown'].indexOf(type) > -1)
        return `<div ${props(getFieldHtmlAttrs(f))} rows="3">${value ?? ''}</div>`
    else if (type === 'checkbox')
        return `<label><input ${props(getFieldHtmlAttrs(f))} type="checkbox" ${flag('checked', !!value)} disabled> ${f.label}</label>`
    else if (type === 'radio' && !f.multiple)
        return f.choices.find(c => c.key == value)?.val ?? ''
    else if (f.multiple && (type === 'radio' || type === 'select'))
        return f.choices
            .filter(c => c.key == value)
            .map(c => c.val)
            .join('<br>') ?? ''
    return ''
}