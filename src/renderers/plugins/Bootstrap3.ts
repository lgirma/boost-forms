export const placeholder = 5
/*
import {LayoutRenderer, PluginOptions, RenderFormOptions, FormLayout} from "../Common";
import {FieldConfig, FormValidationResult, ValidationResult, FormConfig} from "../../Models";
import {vd, DomElementChildrenFrom, isEmpty, AbstractDomElement, toArray, Dict} from "boost-web-core";
import {BootstrapCommonLayout} from './BootstrapCommon'

const Bootstrap3Layout = {
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
            submit: 'btn btn-primary', file: ' ', files: ' ', checkbox: ' ', radio: ' ', range: ' '
        } as any
        let inputClass = classTable[field.type] || 'formConfig-control'
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
        let fieldSet = vd('div', {class: `${field.type === 'checkbox' ? 'checkbox' : `formConfig-group ${validationResult && validationResult.hasError ? 'has-error' : ''}`}`})
        if (field.type != 'checkbox' || field.readonly)
            fieldSet.children.push(...toArray(label), ...toArray(input))
        else {
            let labels = toArray(label)
            if (labels.length > 0 && typeof(labels[0]) != 'string') {
                labels[0].children.unshift(...toArray(input))
                fieldSet.children.push(...labels)
            }
            else
                fieldSet.children.push(...toArray(input), ...toArray(label))
        }

        if (validationResult && validationResult.hasError)
            fieldSet.children.push(vd('div', {class: 'help-block has-error'}, validationResult.message))
        if (!isEmpty(field.helpText))
            fieldSet.children.push(vd('p', {class: 'help-block'}, field.helpText))

        if (!isEmpty(colClass))
            fieldSet = vd('div', {class: colClass}, fieldSet)
        return fieldSet
    }
}

export const Bootstrap3 : (o?: Partial<PluginOptions>) => RenderFormOptions = pluginOptions => ({
    layout: {
        formLayout(forObject: any, formConfig: FormConfig, renderer: LayoutRenderer, validationResult?: FormValidationResult): AbstractDomElement {
            return Bootstrap3Layout.formLayout(forObject, formConfig, renderer, validationResult, pluginOptions)
        }
    }
})*/
