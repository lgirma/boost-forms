import {FieldConfigBase, WebForm} from "./FormService";

export interface VanillaFormOptions {
    labelAttrs?: (fieldConfig: FieldConfigBase) => {}
    inputAttrs?: (fieldConfig: FieldConfigBase) => {}
    fieldSetAttrs?: (fieldConfig: FieldConfigBase) => {}
}

function getAttrs(attrs: {} = {}) {
    attrs = attrs || {}
    return `${Object.keys(attrs).map(a => `${a}="${attrs[a]}"`).join(' ')}`
}

export function renderFormVanilla(forObject, formConfig: WebForm, options: VanillaFormOptions = {}): string {
    const {labelAttrs = f => ({}), fieldSetAttrs = f => ({}), inputAttrs = f => ({})} = options
    return `<form>
        ${Object.keys(formConfig.fieldsConfig).map(k => {
            const fieldConfig = formConfig.fieldsConfig[k]
            return `<div ${getAttrs(fieldSetAttrs(fieldConfig))}>
                ${fieldConfig.type != 'checkbox' || fieldConfig.readonly ? renderLabelVanilla(fieldConfig, labelAttrs(fieldConfig)) : ''}
                ${renderFieldVanilla(forObject[k], fieldConfig, inputAttrs(fieldConfig))}
                ${fieldConfig.type == 'checkbox' && !fieldConfig.readonly ? renderLabelVanilla(fieldConfig, labelAttrs(fieldConfig)) : ''}
            </div>`
        }).join(' ')
    }
    </form>`
}

export function renderFieldVanilla(val, field: FieldConfigBase, attrs = {}) {
    if (field.readonly) {
        if (field.type == 'checkbox')
            return val ? 'Yes' : 'No'
        return `${val == null ? '' : val}`
    }
    if (field.type == 'textarea') {
        return `<textarea ${getAttrs(attrs)} id="${field.id}" name="${field.id}" rows="3" placeholder="${field.placeholder}">${val || ''}</textarea>`
    }
    if (field.type == 'checkbox') {
        return `<input ${getAttrs(attrs)} id="${field.id}" name="${field.id}" type="checkbox" ${val == true ? 'checked' : ''} >`
    }
    if (field.type == 'select') {
        return `<select ${getAttrs(attrs)} id="${field.id}" name="${field.id}">
            ${field.required ? '' : `<option>${field.placeholder || ''}</option>`}
            ${Object.keys(field.selectOptions.options as {})
                .map(k => `<option value="${k}">${field.selectOptions.options[k]}</option>`).join('')}
        </select>`
    }
    if (field.type == 'radio') {
        return Object.keys(field.selectOptions.options as {})
                .map(k => `<label><input ${getAttrs(attrs)} type="radio" name="${field.id}" value="${k}">${field.selectOptions.options[k]}</label>`).join('')

    }
    return `<input ${getAttrs(attrs)} id="${field.id}" name="${field.id}" type="${field.type}" placeholder="${field.placeholder}" value="${val || ''}">`
}

export function renderLabelVanilla(field: FieldConfigBase, attrs = {}) {
    if (!field.showLabel ) return ''
    return `<label for="${field.id}" style="${field.type == 'checkbox' ? 'display: inline-block' : ''}" ${getAttrs(attrs)}>
        ${field.label}${field.required ? '<span style="color:red">*</span>' : ''}
        ${field.readonly ? ':' : ''}
        </label>`
}