export * from './Bootstrap5'
export * from './Bootstrap4'
export * from './Bootstrap3'
/*
import {LayoutRenderer, PluginOptions, RenderFormOptions, FormLayout} from "../Common";
import {FieldConfig, FormValidationResult, ValidationResult, WebForm} from "../../Models";
import {vd, DomElementChildrenFrom, isEmpty, AbstractDomElement} from "boost-web-core";


export const Bootstrap4 : (o?: PluginOptions) => RenderFormOptions = pluginOptions => ({
    layout: {
        formLayout(forObject: any, form: WebForm, renderer: LayoutRenderer, validationResult?: FormValidationResult): AbstractDomElement {
            return BootstrapCommonLayout.formLayout(forObject, form, renderer, this.renderFieldSet, validationResult)
        },
        renderFieldSet(field: FieldConfig, fieldValue: any, renderer: LayoutRenderer, validationResult?: ValidationResult): DomElementChildrenFrom {
            let _pluginOptions = {
                columns: 1,
                isHorizontal: false,
                isInline: false,
                ...pluginOptions
            }
            const isCheckBox = field.type === 'checkbox' || field.type === 'radio'

            let classTable = {
                checkbox: 'form-check-input', radio: 'form-check-input',
                file: 'form-control-file', files: 'form-control-file',
                range: 'form-control-range', submit: 'btn btn-primary',
                select: 'custom-select'
            } as any
            let inputClass = classTable[field.type] || 'form-control'

            if (validationResult && validationResult.hasError)
                inputClass += ' is-invalid'
            if (field.scale != 1)
                inputClass += ` form-control-${field.scale > 1 ? 'lg' : 'sm'}`

            const label = renderer.label(field, {class: (isCheckBox ? 'form-check-label' : '')})
            let input = renderer.input(fieldValue, field, {class: inputClass})
            if (field.type === 'radio') {
                input = Object.keys(field.choices as {})
                    .map((k, i) => vd('div', {class: 'form-check'}, vd('label', {}, [
                        input[i],
                        ' ',
                        field.choices[k]
                    ])))
            }

            let colClass = BootstrapCommonLayout.getColClass(_pluginOptions.columns, field.colSpan)
            let validationMsg = validationResult && validationResult.hasError
                ? vd('div', {class: 'invalid-feedback'}, validationResult.message)
                : null
            let fieldSet = vd('div', {class: `${field.type === 'checkbox' ? 'form-check' : ''}`}, field.type === 'checkbox'
                ? [...(input.constructor === Array ? input : [input]), label, ...[validationMsg]]
                : [label, ...(input.constructor === Array ? input : [input]), ...[validationMsg]])

            if (!isEmpty(colClass))
                fieldSet = vd('div', {class: `mb-2 ${colClass}`}, fieldSet)
            else fieldSet.attrs.class += ' mb-2'
            if (!isEmpty(field.helpText))
                fieldSet.children.push(vd('small', {class: 'form-text text-muted'}, field.helpText))
            return fieldSet
        }
    }
})



export const Bootstrap3 : (o?: PluginOptions) => RenderFormOptions = pluginOptions => ({
    layout: {
        formLayout(forObject, form: WebForm, renderer: LayoutRenderer, validationResult?: FormValidationResult): AbstractDomElement {
            return BootstrapCommonLayout.formLayout(forObject, form, renderer, this.renderFieldSet, validationResult)
        },
        renderFieldSet(field: FieldConfig, fieldValue: any, renderer: LayoutRenderer, validationResult?: ValidationResult): DomElementChildrenFrom {
            let _pluginOptions = {
                columns: 1,
                isHorizontal: false,
                isInline: false,
                ...pluginOptions
            }
            let classTable = {
                submit: 'btn btn-primary', file: ' ', files: ' ', checkbox: ' ', radio: ' ', range: ' '
            } as any
            let inputClass = classTable[field.type] || 'form-control'
            if (field.scale != 1)
                inputClass += ` input-${field.scale > 1 ? 'lg' : 'sm'}`

            const label = renderer.label(field, {})
            let input = renderer.input(fieldValue, field, {class: inputClass})
            if (field.type === 'radio') {
                input = Object.keys(field.choices as {})
                    .map((k, i) => vd('div', {class: (field.multiple ? 'checkbox' : 'radio')}, vd('label', {}, [
                        input[i],
                        ' ',
                        field.choices[k]
                    ])))
            }

            let colClass = BootstrapCommonLayout.getColClass(_pluginOptions.columns, field.colSpan, 'col-md-')
            let validationMsg = validationResult && validationResult.hasError
                ? vd('div', {class: 'help-block has-error'}, validationResult.message)
                : null
            let fieldSet = vd('div', {class: `${field.type === 'checkbox' ? 'checkbox' : `form-group ${validationResult && validationResult.hasError ? 'has-error' : ''}`}`}, field.type === 'checkbox'
                ? [...(input.constructor === Array ? input : [input]), label, ...[validationMsg]]
                : [label, ...(input.constructor === Array ? input : [input]), ...[validationMsg]])
            if (!isEmpty(field.helpText))
                fieldSet.children.push(vd('p', {class: 'help-block'}, field.helpText))
            if (!isEmpty(colClass))
                fieldSet = vd('div', {class: colClass}, fieldSet)
            return fieldSet
        }
    }
})

export const PropertyGrid : (o?: PluginOptions) => RenderFormOptions = pluginOptions => ({
    layout: {
        formLayout(forObject, form: WebForm, renderer: LayoutRenderer, validationResult?: FormValidationResult): AbstractDomElement {
            const result = renderer.form(form)
            const inside = vd('table', {style: {borderCollapse: 'collapse', border: '1px solid lightgrey'}},
                vd('tbody', {},
                    Object.entries(form.fieldsConfig).map((kv) => {
                        const [fieldId, field] = kv
                        const label = renderer.label(field)
                        let input = renderer.input(forObject[fieldId], field)
                        if (field.type === 'radio') {
                            input = Object.keys(field.choices as {})
                                .map((k, i) => vd('label', {}, [
                                    input[i],
                                    ' ',
                                    field.choices[k]
                                ]))
                        }
                        return  vd('tr', {style: {border: '1px solid lightgrey'}}, [
                            vd('td', {style: {border: '1px solid lightgrey'}}, label),
                            vd('td', {style: {border: '1px solid lightgrey'}}, input),
                        ])
                    })))
            result.children.push(inside)
            return result
        }
    }
})

export const Bulma : (o?: PluginOptions) => RenderFormOptions = pluginOptions => ({
    layout: {
        formLayout(forObject, form: WebForm, renderer: LayoutRenderer, validationResult?: FormValidationResult): AbstractDomElement {
            const result = renderer.form(form, {class: 'columns is-multiline'})
            validationResult ??= {hasError: false, message: '', fields: {}}
            for (const [fieldId, field] of Object.entries(form.fieldsConfig)) {
                result.children.push(this.renderFieldSet(field, forObject[fieldId], renderer, validationResult.fields[fieldId]))
            }
            return result;
        },
        renderFieldSet(field: FieldConfig, fieldValue: any, renderer: LayoutRenderer, validationResult?: ValidationResult): DomElementChildrenFrom {
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
                input = vd('div', {class: 'control'},
                    Object.keys(field.choices as {})
                    .map((k, i) => vd('label', {class: 'radio'}, [
                        input[i],
                        ' ',
                        field.choices[k]
                    ]))
                )
            }
            else if (field.type === 'select') {
                input = vd('div', {class: 'select is-fullwidth'}, input)
            }
            let validationMsg = validationResult && validationResult.hasError
                ? vd('div', {class: 'help is-danger'}, validationResult.message)
                : null
            let helpText = !isEmpty(field.helpText) ? vd('div', {class: 'help'}, field.helpText) : null
            let colClass = this.getColClass(pluginOptions.columns, field.colSpan)

            return vd('div', {class: `${colClass} field ${field.type === 'checkbox' ? 'form-check' : ''}`}, field.type === 'checkbox'
                ? [...(input.constructor === Array ? input : [input]), ' ', label, ...[validationMsg], ...[helpText]]
                : [label, ' ', ...(input.constructor === Array ? input : [input]), ...[validationMsg], ...[helpText]])
        },
        getColClass(columns: number, colSpan: number) {
            return columns > 1 ? `column is-${12 * colSpan / columns}` : ''
        }
    }
})

*/
