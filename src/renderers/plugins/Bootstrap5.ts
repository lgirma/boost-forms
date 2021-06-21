export const placeholder = 5
/*
import {LayoutRenderer, PluginOptions, RenderFormOptions, FormLayout} from "../Common";
import {FieldConfig, FormValidationResult, ValidationResult, FormConfig} from "../../Models";
import {vd, DomElementChildrenFrom, isEmpty, AbstractDomElement, toArray, Dict} from "boost-web-core";
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
            checkbox: 'formConfig-check-input', radio: 'formConfig-check-input',
            range: 'formConfig-range', submit: 'btn btn-primary', select: 'formConfig-select'
        } as any
        let inputClass: string = classTable[field.type] ?? 'formConfig-control'
        if (field.scale != 1)
            inputClass += ` formConfig-control-${field.scale > 1 ? 'lg' : 'sm'}`
        if (field.type === 'color')
            inputClass += ' formConfig-control-color'

        if (validationResult && validationResult.hasError)
            inputClass += ' is-invalid'

        const label = renderer.label(field, {class: (isCheckBox ? 'formConfig-check-label' : 'formConfig-label')})
        let input = renderer.input(fieldValue, field, {class: inputClass})
        if (field.type === 'radio') {
            input = Object.keys(field.choices)
                .map((k, i) => vd('div', {class: 'formConfig-check'},
                    vd('label', {class: 'formConfig-check-label'}, [
                        input[i],
                        ' ',
                        (field.choices as Dict<string>)[k]
                    ])))
        }

        let colClass = BootstrapCommonLayout.getColClass(_pluginOptions.columns, field.colSpan)
        let fieldSet = vd('div', {class: `${field.type === 'checkbox' ? 'formConfig-check' : ''}`})
        if (field.type != 'checkbox' || field.readonly)
            fieldSet.children.push(...toArray(label), ...toArray(input))
        else
            fieldSet.children.push(...toArray(input), ...toArray(label))

        if (validationResult && validationResult.hasError)
            fieldSet.children.push(vd('div', {class: 'invalid-feedback'}, validationResult.message))

        if (!isEmpty(colClass))
            fieldSet = vd('div', {class: `mb-2 ${colClass}`}, fieldSet)
        else fieldSet.htmlAttrs.class += ' mb-2'
        if (!isEmpty(field.helpText))
            fieldSet.children.push(vd('div', {class: 'formConfig-text'}, field.helpText))
        return fieldSet
    }
}

export const Bootstrap5 : (o?: Partial<PluginOptions>) => RenderFormOptions = pluginOptions => ({
    layout: {
        formLayout(forObject: any, formConfig: FormConfig, renderer: LayoutRenderer, validationResult?: FormValidationResult): AbstractDomElement {
            return Bootstrap5Layout.formLayout(forObject, formConfig, renderer, validationResult, pluginOptions)
        }
    }
})*/
