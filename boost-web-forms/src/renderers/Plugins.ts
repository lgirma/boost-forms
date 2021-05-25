import {LayoutRenderer, PluginOptions, RenderFormOptions} from "./Common";
import {FieldConfigBase, FormValidationResult, ValidationResult, WebForm} from "../Models";
import {vdom, DomElementChildrenFrom, isEmpty} from "boost-web-core";

const BootstrapCommon = {
    renderForm(forObject, form: WebForm, renderer: LayoutRenderer, renderFieldSet, validationResult?: FormValidationResult): DomElementChildrenFrom {
        const result = renderer.form(form, {class: 'row'})
        for (const [fieldId, field] of Object.entries(form.fieldsConfig)) {
            result.children.push(renderFieldSet(field, forObject[fieldId], renderer, validationResult.fields[fieldId]))
        }
        return result;
    },
    getColClass(columns: number, colSpan: number, prefix = 'col-') {
        return columns > 1 ? `${prefix}${12 * colSpan / columns}` : ''
    }
}

export const Bootstrap5 : (o?: PluginOptions) => RenderFormOptions = pluginOptions => ({
    layout: {
        renderForm(forObject, form: WebForm, renderer: LayoutRenderer, validationResult?: FormValidationResult): DomElementChildrenFrom {
            return BootstrapCommon.renderForm(forObject, form, renderer, this.renderFieldSet, validationResult)
        },
        renderFieldSet(field: FieldConfigBase, fieldValue: any, renderer: LayoutRenderer, validationResult?: ValidationResult): DomElementChildrenFrom {
            const isCheckBox = field.type === 'checkbox' || field.type === 'radio'
            let classTable = {
                checkbox: 'form-check-input', radio: 'form-check-input',
                range: 'form-range', submit: 'btn btn-primary', select: 'form-select'
            }
            let inputClass = classTable[field.type] || 'form-control'
            if (field.scale != 1)
                inputClass += ` form-control-${field.scale > 1 ? 'lg' : 'sm'}`
            if (field.type === 'color')
                inputClass += ' form-control-color'

            if (validationResult && validationResult.hasError)
                inputClass += ' is-invalid'

            const label = renderer.label(field, {class: (isCheckBox ? 'form-check-label' : 'form-label')})
            let input = renderer.input(fieldValue, field, {class: inputClass})
            if (field.type === 'radio') {
                input = Object.keys(field.choices as {})
                    .map((k, i) => vdom('div', {class: 'form-check'},
                        vdom('label', {class: 'form-check-label'}, [
                            input[i],
                            ' ',
                            field.choices[k]
                        ])))
            }

            let colClass = BootstrapCommon.getColClass(pluginOptions.columns, field.colSpan)
            let validationMsg = validationResult && validationResult.hasError
                ? vdom('div', {class: 'invalid-feedback'}, validationResult.message)
                : null
            let fieldSet = vdom('div', {class: `${field.type === 'checkbox' ? 'form-check' : ''}`}, field.type === 'checkbox'
                ? [...(input.constructor === Array ? input : [input]), label, ...[validationMsg]]
                : [label, ...(input.constructor === Array ? input : [input]), ...[validationMsg]])

            if (!isEmpty(colClass))
                fieldSet = vdom('div', {class: `mb-2 ${colClass}`}, fieldSet)
            else fieldSet.attrs.class += ' mb-2'
            if (!isEmpty(field.helpText))
                fieldSet.children.push(vdom('div', {class: 'form-text'}, field.helpText))
            return fieldSet
        }
    }
})


export const Bootstrap4 : (o?: PluginOptions) => RenderFormOptions = pluginOptions => ({
    layout: {
        renderForm(forObject, form: WebForm, renderer: LayoutRenderer, validationResult?: FormValidationResult): DomElementChildrenFrom {
            return BootstrapCommon.renderForm(forObject, form, renderer, this.renderFieldSet, validationResult)
        },
        renderFieldSet(field: FieldConfigBase, fieldValue: any, renderer: LayoutRenderer, validationResult?: ValidationResult): DomElementChildrenFrom {
            const isCheckBox = field.type === 'checkbox' || field.type === 'radio'

            let classTable = {
                checkbox: 'form-check-input', radio: 'form-check-input',
                file: 'form-control-file', files: 'form-control-file',
                range: 'form-control-range', submit: 'btn btn-primary',
                select: 'custom-select'
            }
            let inputClass = classTable[field.type] || 'form-control'

            if (validationResult && validationResult.hasError)
                inputClass += ' is-invalid'
            if (field.scale != 1)
                inputClass += ` form-control-${field.scale > 1 ? 'lg' : 'sm'}`

            const label = renderer.label(field, {class: (isCheckBox ? 'form-check-label' : '')})
            let input = renderer.input(fieldValue, field, {class: inputClass})
            if (field.type === 'radio') {
                input = Object.keys(field.choices as {})
                    .map((k, i) => vdom('div', {class: 'form-check'}, vdom('label', {}, [
                        input[i],
                        ' ',
                        field.choices[k]
                    ])))
            }

            let colClass = BootstrapCommon.getColClass(pluginOptions.columns, field.colSpan)
            let validationMsg = validationResult && validationResult.hasError
                ? vdom('div', {class: 'invalid-feedback'}, validationResult.message)
                : null
            let fieldSet = vdom('div', {class: `${field.type === 'checkbox' ? 'form-check' : ''}`}, field.type === 'checkbox'
                ? [...(input.constructor === Array ? input : [input]), label, ...[validationMsg]]
                : [label, ...(input.constructor === Array ? input : [input]), ...[validationMsg]])

            if (!isEmpty(colClass))
                fieldSet = vdom('div', {class: `mb-2 ${colClass}`}, fieldSet)
            else fieldSet.attrs.class += ' mb-2'
            if (!isEmpty(field.helpText))
                fieldSet.children.push(vdom('small', {class: 'form-text text-muted'}, field.helpText))
            return fieldSet
        }
    }
})



export const Bootstrap3 : (o?: PluginOptions) => RenderFormOptions = pluginOptions => ({
    layout: {
        renderForm(forObject, form: WebForm, renderer: LayoutRenderer, validationResult?: FormValidationResult): DomElementChildrenFrom {
            return BootstrapCommon.renderForm(forObject, form, renderer, this.renderFieldSet, validationResult)
        },
        renderFieldSet(field: FieldConfigBase, fieldValue: any, renderer: LayoutRenderer, validationResult?: ValidationResult): DomElementChildrenFrom {
            let classTable = {
                submit: 'btn btn-primary', file: ' ', files: ' ', checkbox: ' ', radio: ' ', range: ' '
            }
            let inputClass = classTable[field.type] || 'form-control'
            if (field.scale != 1)
                inputClass += ` input-${field.scale > 1 ? 'lg' : 'sm'}`

            const label = renderer.label(field, {})
            let input = renderer.input(fieldValue, field, {class: inputClass})
            if (field.type === 'radio') {
                input = Object.keys(field.choices as {})
                    .map((k, i) => vdom('div', {class: (field.multiple ? 'checkbox' : 'radio')}, vdom('label', {}, [
                        input[i],
                        ' ',
                        field.choices[k]
                    ])))
            }

            let colClass = BootstrapCommon.getColClass(pluginOptions.columns, field.colSpan, 'col-md-')
            let validationMsg = validationResult && validationResult.hasError
                ? vdom('div', {class: 'help-block has-error'}, validationResult.message)
                : null
            let fieldSet = vdom('div', {class: `${field.type === 'checkbox' ? 'checkbox' : `form-group ${validationResult && validationResult.hasError ? 'has-error' : ''}`}`}, field.type === 'checkbox'
                ? [...(input.constructor === Array ? input : [input]), label, ...[validationMsg]]
                : [label, ...(input.constructor === Array ? input : [input]), ...[validationMsg]])
            if (!isEmpty(field.helpText))
                fieldSet.children.push(vdom('p', {class: 'help-block'}, field.helpText))
            if (!isEmpty(colClass))
                fieldSet = vdom('div', {class: colClass}, fieldSet)
            return fieldSet
        }
    }
})

export const PropertyGrid : (o?: PluginOptions) => RenderFormOptions = pluginOptions => ({
    layout: {
        renderForm(forObject, form: WebForm, renderer: LayoutRenderer, validationResult?: FormValidationResult): DomElementChildrenFrom {
            const result = renderer.form(form)
            const inside = vdom('table', {style: {borderCollapse: 'collapse', border: '1px solid lightgrey'}},
                vdom('tbody', {},
                    Object.entries(form.fieldsConfig).map((kv) => {
                        const [fieldId, field] = kv
                        const label = renderer.label(field)
                        let input = renderer.input(forObject[fieldId], field)
                        if (field.type === 'radio') {
                            input = Object.keys(field.choices as {})
                                .map((k, i) => vdom('label', {}, [
                                    input[i],
                                    ' ',
                                    field.choices[k]
                                ]))
                        }
                        return  vdom('tr', {style: {border: '1px solid lightgrey'}}, [
                            vdom('td', {style: {border: '1px solid lightgrey'}}, label),
                            vdom('td', {style: {border: '1px solid lightgrey'}}, input),
                        ])
                    })))
            result.children.push(inside)
            return result
        }
    }
})

export const Bulma : (o?: PluginOptions) => RenderFormOptions = pluginOptions => ({
    layout: {
        renderForm(forObject, form: WebForm, renderer: LayoutRenderer, validationResult?: FormValidationResult): DomElementChildrenFrom {
            const result = renderer.form(form, {class: 'columns is-multiline'})
            for (const [fieldId, field] of Object.entries(form.fieldsConfig)) {
                result.children.push(this.renderFieldSet(field, forObject[fieldId], renderer, validationResult.fields[fieldId]))
            }
            return result;
        },
        renderFieldSet(field: FieldConfigBase, fieldValue: any, renderer: LayoutRenderer, validationResult?: ValidationResult): DomElementChildrenFrom {
            const isCheckBox = field.type === 'checkbox' || field.type === 'radio'

            let inputClass = 'input'
            if (field.type === 'textarea')
                inputClass = 'textarea'
            else if (field.type == 'submit')
                inputClass = 'button is-primary'
            else if (field.type !== 'checkbox' && field.type !== 'radio' && field.scale != 1)
                inputClass = `input${field.scale > 1 ? ' is-large' : ''}${(field.scale && field.scale < 1) ? ' is-small' : ''}`
            else if (field.type === 'checkbox' || field.type === 'radio' || field.type === 'range')
                inputClass = ''

            if (validationResult && validationResult.hasError)
                inputClass += ' is-danger'
            let labelClass = ''
            if (validationResult && validationResult.hasError && (field.type == 'radio' || field.type == 'checkbox'))
                labelClass += ' has-text-danger'

            const label = renderer.label(field, {class: `${labelClass} ${isCheckBox ? 'checkbox' : 'label'}`})
            let input = renderer.input(fieldValue, field, {class: inputClass})
            if (field.type === 'radio') {
                input = vdom('div', {class: 'control'},
                    Object.keys(field.choices as {})
                    .map((k, i) => vdom('label', {class: 'radio'}, [
                        input[i],
                        ' ',
                        field.choices[k]
                    ]))
                )
            }
            else if (field.type === 'select') {
                input = vdom('div', {class: 'select is-fullwidth'}, input)
            }
            let validationMsg = validationResult && validationResult.hasError
                ? vdom('div', {class: 'help is-danger'}, validationResult.message)
                : null
            let helpText = !isEmpty(field.helpText) ? vdom('div', {class: 'help'}, field.helpText) : null
            let colClass = this.getColClass(pluginOptions.columns, field.colSpan)

            return vdom('div', {class: `${colClass} field ${field.type === 'checkbox' ? 'form-check' : ''}`}, field.type === 'checkbox'
                ? [...(input.constructor === Array ? input : [input]), ' ', label, ...[validationMsg], ...[helpText]]
                : [label, ' ', ...(input.constructor === Array ? input : [input]), ...[validationMsg], ...[helpText]])
        },
        getColClass(columns: number, colSpan: number) {
            return columns > 1 ? `column is-${12 * colSpan / columns}` : ''
        }
    }
})

/*
export const MDB5 : RenderFormOptions = {
    submitAttrs: (forObj, options) => {
        return {class: 'btn btn-primary'}
    },
    layout: {
        renderFieldSet(field: FieldConfigBase, fieldValue: any, renderer: LayoutRenderer, form?: WebForm, forObject?): DomElementChildrenFrom {
            const isCheckBox = field.type === 'checkbox' || field.type === 'radio'

            let inputClass = 'form-control'
            if (isCheckBox)
                inputClass = 'form-check-input'
            else if (field.type === 'range')
                inputClass = 'form-range'
            else if (field.type === 'color')
                inputClass += ' form-control-color'
            else if (field.type === 'select')
                inputClass = 'form-select'

            if (field.scale > 1)
                inputClass += ' form-control-lg'
            else if (field.scale < 1)
                inputClass += ' form-control-sm'

            const label = renderer.label(field, {class: (isCheckBox ? 'form-check-label' : 'form-label')})
            let input = renderer.input(fieldValue, field, {class: inputClass})
            if (field.type === 'radio') {
                input = Object.keys(field.choices as {})
                    .map((k, i) => vdom('div', {class: 'form-check'},
                        vdom('label', {class: 'form-check-label'}, [
                            input[i],
                            ' ',
                            field.choices[k]
                        ])))
            }

            return vdom('div', {class: `mb-2 ${isCheckBox || field.type === 'file' || field.type === 'files' ? '' : ''}`},
                [...(input.constructor === Array ? input : [input]), label] as any)
        }
    }
}*/
