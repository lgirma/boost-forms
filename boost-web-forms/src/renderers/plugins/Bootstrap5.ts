import {LayoutRenderer, PluginOptions, RenderFormOptions, FormLayout} from "../Common";
import {FieldConfig, FormValidationResult, ValidationResult, WebForm} from "../../Models";
import {vdom, DomElementChildrenFrom, isEmpty, AbstractDomElement, toArray, Dict} from "boost-web-core";
import {BootstrapCommonLayout} from './BootstrapCommon'
import {options} from "../../main/main_common";

const Bootstrap5Layout = {
    ...BootstrapCommonLayout,
    renderFieldSet(field: FieldConfig, fieldValue: any, renderer: LayoutRenderer, validationResult?: ValidationResult,
                   pluginOptions?: Partial<PluginOptions>): DomElementChildrenFrom {
        let _pluginOptions = {
            columns: 1,
            isHorizontal: false,
            isInline: false,
            ...pluginOptions
        }
        const isCheckBox = field.type === 'checkbox' || field.type === 'radio'
        let classTable = {
            checkbox: 'form-check-input', radio: 'form-check-input',
            range: 'form-range', submit: 'btn btn-primary', select: 'form-select'
        } as any
        let inputClass: string = classTable[field.type] ?? 'form-control'
        if (field.scale != 1)
            inputClass += ` form-control-${field.scale > 1 ? 'lg' : 'sm'}`
        if (field.type === 'color')
            inputClass += ' form-control-color'

        if (validationResult && validationResult.hasError)
            inputClass += ' is-invalid'

        const label = renderer.label(field, {class: (isCheckBox ? 'form-check-label' : 'form-label')})
        let input = renderer.input(fieldValue, field, {class: inputClass})
        if (field.type === 'radio') {
            input = Object.keys(field.choices)
                .map((k, i) => vdom('div', {class: 'form-check'},
                    vdom('label', {class: 'form-check-label'}, [
                        input[i],
                        ' ',
                        (field.choices as Dict<string>)[k]
                    ])))
        }

        let colClass = BootstrapCommonLayout.getColClass(_pluginOptions.columns, field.colSpan)
        let fieldSet = vdom('div', {class: `${field.type === 'checkbox' ? 'form-check' : ''}`})
        if (field.type != 'checkbox' || field.readonly)
            fieldSet.children.push(...toArray(label), ...toArray(input))
        else
            fieldSet.children.push(...toArray(input), ...toArray(label))

        if (validationResult && validationResult.hasError)
            fieldSet.children.push(vdom('div', {class: 'invalid-feedback'}, validationResult.message))

        if (!isEmpty(colClass))
            fieldSet = vdom('div', {class: `mb-2 ${colClass}`}, fieldSet)
        else fieldSet.attrs.class += ' mb-2'
        if (!isEmpty(field.helpText))
            fieldSet.children.push(vdom('div', {class: 'form-text'}, field.helpText))
        return fieldSet
    }
}

export const Bootstrap5 : (o?: Partial<PluginOptions>) => RenderFormOptions = pluginOptions => ({
    layout: {
        formLayout(forObject: any, form: WebForm, renderer: LayoutRenderer, validationResult?: FormValidationResult): AbstractDomElement {
            return Bootstrap5Layout.formLayout(forObject, form, renderer, validationResult, pluginOptions)
        }
    }
})