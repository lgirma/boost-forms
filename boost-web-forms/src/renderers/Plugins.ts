import {LayoutRenderer, PluginOptions, RenderFormOptions} from "./Common";
import {FieldConfigBase, WebForm} from "../Models";
import {createAbstractDom, DomElementChildrenFrom} from "boost-web-core";

export const Bootstrap5 : (o?: PluginOptions) => RenderFormOptions = pluginOptions => ({
    layout: {
        renderForm(forObject, form: WebForm, renderer: LayoutRenderer): DomElementChildrenFrom {
            const result = createAbstractDom('div', {class: 'row'})
            for (const [fieldId, field] of Object.entries(form.fieldsConfig)) {
                result.children.push(this.renderFieldSet(field, forObject[fieldId], renderer))
            }
            return result;
        },
        renderFieldSet(field: FieldConfigBase, fieldValue: any, renderer: LayoutRenderer): DomElementChildrenFrom {
            const isCheckBox = field.type === 'checkbox' || field.type === 'radio'

            let inputClass = 'form-control'
            if (isCheckBox)
                inputClass = 'form-check-input'
            else if (field.type === 'range')
                inputClass = 'form-range'
            else if (field.type === 'submit')
                inputClass = 'btn btn-primary'
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
                    .map((k, i) => createAbstractDom('div', {class: 'form-check'},
                        createAbstractDom('label', {class: 'form-check-label'}, [
                            input[i],
                            ' ',
                            field.choices[k]
                        ])))
            }

            let colClass = pluginOptions.columns > 1 ? `col-${12 / pluginOptions.columns}` : ''
            return createAbstractDom('div', {class: `mb-2 ${colClass} ${field.type === 'checkbox' ? 'form-check' : ''}`}, field.type === 'checkbox'
                ? [...(input.constructor === Array ? input : [input]), label]
                : [label, ...(input.constructor === Array ? input : [input])] as any)
        }
    }
})

export const PropertyGrid : (o?: PluginOptions) => RenderFormOptions = pluginOptions => ({
    submitAttrs: (forObj, options) => {
        return {class: 'btn btn-primary'}
    },
    layout: {
        renderForm(forObject, form: WebForm, renderer: LayoutRenderer): DomElementChildrenFrom {
            return createAbstractDom('table', {style: {borderCollapse: 'collapse', border: '1px solid lightgrey'}},
                createAbstractDom('tbody', {},
                    Object.entries(form.fieldsConfig).map((kv) => {
                        const [fieldId, field] = kv
                        const label = renderer.label(field)
                        let input = renderer.input(forObject[fieldId], field)
                        if (field.type === 'radio') {
                            input = Object.keys(field.choices as {})
                                .map((k, i) => createAbstractDom('label', {}, [
                                    input[i],
                                    ' ',
                                    field.choices[k]
                                ]))
                        }
                        return  createAbstractDom('tr', {style: {border: '1px solid lightgrey'}}, [
                            createAbstractDom('td', {style: {border: '1px solid lightgrey'}}, label),
                            createAbstractDom('td', {style: {border: '1px solid lightgrey'}}, input),
                        ])
                    })))
        }
    }
})

/*
export const Bootstrap4 : RenderFormOptions = {
    submitAttrs: (forObj, options) => {
        return {class: 'btn btn-primary'}
    },
    layout: {
        renderFieldSet(field: FieldConfigBase, fieldValue: any, renderer: LayoutRenderer, form?: WebForm, forObject?): DomElementChildrenFrom {
            const isCheckBox = field.type === 'checkbox' || field.type === 'radio'

            let inputClass = 'form-control'
            if (isCheckBox)
                inputClass = 'form-check-input'
            else if (field.type === 'file' || field.type === 'files')
                inputClass = 'form-control-file'
            else if (field.type === 'range')
                inputClass = 'form-control-range'

            if (field.scale > 1)
                inputClass += ' form-control-lg'
            else if (field.scale < 1)
                inputClass += ' form-control-sm'

            const label = renderer.label(field, {class: (isCheckBox ? 'form-check-label' : '')})
            let input = renderer.input(fieldValue, field, {class: inputClass})
            if (field.type === 'radio') {
                input = Object.keys(field.choices as {})
                    .map((k, i) => createAbstractDom('div', {class: 'form-check'}, createAbstractDom('label', {}, [
                        input[i],
                        ' ',
                        field.choices[k]
                    ])))
            }

            return createAbstractDom('div', {class: `form-group ${field.type === 'checkbox' ? 'form-check' : ''}`}, field.type === 'checkbox'
                ? [...(input.constructor === Array ? input : [input]), label]
                : [label, ...(input.constructor === Array ? input : [input])] as any)
        }
    }
}

export const Bulma : RenderFormOptions = {
    submitAttrs: (forObj, options) => {
        return {class: 'button is-primary'}
    },
    layout: {
        renderFieldSet(field: FieldConfigBase, fieldValue: any, renderer: LayoutRenderer, form?: WebForm, forObject?): DomElementChildrenFrom {
            const isCheckBox = field.type === 'checkbox' || field.type === 'radio'

            let inputClass = 'input'
            if (field.type === 'textarea')
                inputClass = 'textarea'
            else if (field.type !== 'checkbox' && field.type !== 'radio')
                inputClass = `input${field.scale > 1 ? ' is-large' : ''}${(field.scale && field.scale < 1) ? ' is-small' : ''}`
            else if (field.type === 'checkbox' || field.type === 'radio')
                inputClass = ''

            const label = renderer.label(field, {class: (isCheckBox ? 'checkbox' : 'label')})
            let input = renderer.input(fieldValue, field, {class: inputClass})
            if (field.type === 'radio') {
                input = createAbstractDom('div', {class: 'control'},
                    Object.keys(field.choices as {})
                    .map((k, i) => createAbstractDom('label', {class: 'radio'}, [
                        input[i],
                        ' ',
                        field.choices[k]
                    ]))
                )
            }
            else if (field.type === 'select') {
                input = createAbstractDom('div', {class: 'select'}, input)
            }

            return createAbstractDom('div', {class: `form-group ${field.type === 'checkbox' ? 'form-check' : ''}`}, field.type === 'checkbox'
                ? [...(input.constructor === Array ? input : [input]), label]
                : [label, ...(input.constructor === Array ? input : [input])] as any)
        }
    }
}

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
                    .map((k, i) => createAbstractDom('div', {class: 'form-check'},
                        createAbstractDom('label', {class: 'form-check-label'}, [
                            input[i],
                            ' ',
                            field.choices[k]
                        ])))
            }

            return createAbstractDom('div', {class: `mb-2 ${isCheckBox || field.type === 'file' || field.type === 'files' ? '' : ''}`},
                [...(input.constructor === Array ? input : [input]), label] as any)
        }
    }
}*/
