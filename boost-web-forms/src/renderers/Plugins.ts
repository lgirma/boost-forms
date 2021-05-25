import {LayoutRenderer, PluginOptions, RenderFormOptions} from "./Common";
import {FieldConfigBase, WebForm} from "../Models";
import {vdom, DomElementChildrenFrom, isEmpty} from "boost-web-core";

const BootstrapCommon = {
    renderForm(forObject, form: WebForm, renderer: LayoutRenderer, renderFieldSet): DomElementChildrenFrom {
        const result = renderer.form(form, {class: 'row'})
        for (const [fieldId, field] of Object.entries(form.fieldsConfig)) {
            result.children.push(renderFieldSet(field, forObject[fieldId], renderer))
        }
        return result;
    },
    getColClass(columns: number, colSpan: number, prefix = 'col-') {
        return columns > 1 ? `${prefix}${12 * colSpan / columns}` : ''
    }
}

export const Bootstrap5 : (o?: PluginOptions) => RenderFormOptions = pluginOptions => ({
    layout: {
        renderForm(forObject, form: WebForm, renderer: LayoutRenderer): DomElementChildrenFrom {
            return BootstrapCommon.renderForm(forObject, form, renderer, this.renderFieldSet)
        },
        renderFieldSet(field: FieldConfigBase, fieldValue: any, renderer: LayoutRenderer): DomElementChildrenFrom {
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
            let fieldSet = vdom('div', {class: `${field.type === 'checkbox' ? 'form-check' : ''}`}, field.type === 'checkbox'
                ? [...(input.constructor === Array ? input : [input]), label]
                : [label, ...(input.constructor === Array ? input : [input])])

            if (!isEmpty(colClass))
                fieldSet = vdom('div', {class: `mb-2 ${colClass}`}, fieldSet)
            else fieldSet.attrs.class += ' mb-2'
            return fieldSet
        }
    }
})


export const Bootstrap4 : (o?: PluginOptions) => RenderFormOptions = pluginOptions => ({
    layout: {
        renderForm(forObject, form: WebForm, renderer: LayoutRenderer): DomElementChildrenFrom {
            return BootstrapCommon.renderForm(forObject, form, renderer, this.renderFieldSet)
        },
        renderFieldSet(field: FieldConfigBase, fieldValue: any, renderer: LayoutRenderer): DomElementChildrenFrom {
            const isCheckBox = field.type === 'checkbox' || field.type === 'radio'

            let classTable = {
                checkbox: 'form-check-input', radio: 'form-check-input',
                file: 'form-control-file', files: 'form-control-file',
                range: 'form-control-range', submit: 'btn btn-primary'
            }
            let inputClass = classTable[field.type] || 'form-control'
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
            let fieldSet = vdom('div', {class: `${field.type === 'checkbox' ? 'form-check' : ''}`}, field.type === 'checkbox'
                ? [...(input.constructor === Array ? input : [input]), label]
                : [label, ...(input.constructor === Array ? input : [input])])

            if (!isEmpty(colClass))
                fieldSet = vdom('div', {class: `mb-2 ${colClass}`}, fieldSet)
            else fieldSet.attrs.class += ' mb-2'
            return fieldSet
        }
    }
})



export const Bootstrap3 : (o?: PluginOptions) => RenderFormOptions = pluginOptions => ({
    layout: {
        renderForm(forObject, form: WebForm, renderer: LayoutRenderer): DomElementChildrenFrom {
            return BootstrapCommon.renderForm(forObject, form, renderer, this.renderFieldSet)
        },
        renderFieldSet(field: FieldConfigBase, fieldValue: any, renderer: LayoutRenderer): DomElementChildrenFrom {
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
            let fieldSet = vdom('div', {class: `${field.type === 'checkbox' ? 'checkbox' : 'form-group'}`}, field.type === 'checkbox'
                ? [...(input.constructor === Array ? input : [input]), label]
                : [label, ...(input.constructor === Array ? input : [input])])
            if (!isEmpty(colClass))
                fieldSet = vdom('div', {class: colClass}, fieldSet)
            return fieldSet
        }
    }
})

export const PropertyGrid : (o?: PluginOptions) => RenderFormOptions = pluginOptions => ({
    layout: {
        renderForm(forObject, form: WebForm, renderer: LayoutRenderer): DomElementChildrenFrom {
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
        renderForm(forObject, form: WebForm, renderer: LayoutRenderer): DomElementChildrenFrom {
            const result = renderer.form(form, {class: 'row'})
            for (const [fieldId, field] of Object.entries(form.fieldsConfig)) {
                result.children.push(this.renderFieldSet(field, forObject[fieldId], renderer))
            }
            return result;
        },
        renderFieldSet(field: FieldConfigBase, fieldValue: any, renderer: LayoutRenderer): DomElementChildrenFrom {
            const isCheckBox = field.type === 'checkbox' || field.type === 'radio'

            let inputClass = 'input'
            if (field.type === 'textarea')
                inputClass = 'textarea'
            else if (field.type == 'submit')
                inputClass = 'button is-primary'
            else if (field.type !== 'checkbox' && field.type !== 'radio')
                inputClass = `input${field.scale > 1 ? ' is-large' : ''}${(field.scale && field.scale < 1) ? ' is-small' : ''}`
            else if (field.type === 'checkbox' || field.type === 'radio')
                inputClass = ''

            const label = renderer.label(field, {class: (isCheckBox ? 'checkbox' : 'label')})
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
                input = vdom('div', {class: 'select'}, input)
            }

            return vdom('div', {class: `form-group ${field.type === 'checkbox' ? 'form-check' : ''}`}, field.type === 'checkbox'
                ? [...(input.constructor === Array ? input : [input]), label]
                : [label, ...(input.constructor === Array ? input : [input])] as any)
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
