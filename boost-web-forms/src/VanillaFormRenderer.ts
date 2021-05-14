import {FieldConfigBase, WebForm} from "./FormService";

export function renderFormVanilla(forObject, formConfig: WebForm): string {
    return `<form>
        ${Object.keys(formConfig.fieldsConfig).map(k => {
            const fieldConfig = formConfig.fieldsConfig[k]
            return `<div>
                ${fieldConfig.type != 'checkbox' || fieldConfig.readonly ? renderLabelVanilla(fieldConfig) : ''}
                ${renderFieldVanilla(forObject[k], fieldConfig)}
                ${fieldConfig.type == 'checkbox' && !fieldConfig.readonly ? renderLabelVanilla(fieldConfig) : ''}
            </div>`
        }).join(' ')
    }
    </form>`
}

export function renderFieldVanilla(val, field: FieldConfigBase) {
    if (field.readonly) {
        if (field.type == 'checkbox')
            return val ? 'Yes' : 'No'
        return `${val == null ? '' : val}`
    }
    if (field.type == 'textarea') {
        return `<textarea id="${field.id}" name="${field.id}" rows="3" placeholder="${field.placeholder}">${val || ''}</textarea>`
    }
    if (field.type == 'checkbox') {
        return `<input id="${field.id}" name="${field.id}" type="checkbox" ${val == true ? 'checked' : ''} >`
    }
    if (field.type == 'select') {
        return `<select id="${field.id}" name="${field.id}">
            ${field.required ? '' : `<option>${field.placeholder || ''}</option>`}
            ${Object.keys(field.selectOptions.options as {})
                .map(k => `<option value="${k}">${field.selectOptions.options[k]}</option>`).join('')}
        </select>`
    }
    return `<input id="${field.id}" name="${field.id}" type="${field.type}" placeholder="${field.placeholder}" value="${val || ''}">`
}

export function renderLabelVanilla(field: FieldConfigBase) {
    if (!field.showLabel) return ''
    return `<label for="${field.id}">
        ${field.label}${field.required ? '<span style="color:red">*</span>' : ''}
        ${field.readonly ? ':' : ''}
        </label>`
}