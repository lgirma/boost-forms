import {AbstractDomElement, h} from 'vdtree'
import {FormConfig, FormValidationResult} from "../Models";
import {AbstractInput} from "./AbstractInput";
import {AbstractLabel} from "./AbstractLabel";
import {Dict, toArray} from "boost-web-core";
import {createFormConfig, getFormHtmlAttrs} from "../FormService";

export interface FormLayoutProps {
    forObject: any,
    formConfig?: FormConfig,
    validationResult?: FormValidationResult
    htmlAttrs?: any
}

export function DefaultFormLayout({forObject, formConfig, validationResult, htmlAttrs = {}}: FormLayoutProps): AbstractDomElement {
    let _formConfig = formConfig ?? createFormConfig(forObject)
    let result = h(_formConfig.excludeSubmitButton ? 'div' : 'form',
        {...getFormHtmlAttrs(_formConfig), ...htmlAttrs})
    for (const fieldId in _formConfig.fieldsConfig) {
        if (!_formConfig.fieldsConfig.hasOwnProperty(fieldId))
            continue
        let field = _formConfig.fieldsConfig[fieldId]
        let fieldSet = h('div', {})
        const fieldValidationResult = validationResult?.fields[fieldId] ?? {hasError: false}
        let input = AbstractInput({field, value: forObject[fieldId], validationResult: validationResult?.fields[fieldId]})
        let label = AbstractLabel({field, validationResult: validationResult?.fields[fieldId]})

        if (field.type === 'radio') {
            input = Object.keys(field.choices as {})
                .map((k, i) => h('label', {},
                    input[i],
                    ' ',
                    (field.choices as Dict<string>)[k]
                ))
        }

        if (field.type != 'checkbox' || field.readonly)
            fieldSet.children.push(...toArray(label), ' ', ...toArray(input))
        else
            fieldSet.children.push(...toArray(input), ' ', ...toArray(label))

        if (fieldValidationResult.hasError)
            fieldSet.children.push(h('div', {style: {color: 'red'}},
                h('small', {}, fieldValidationResult.message)))
        result.children.push(fieldSet)
    }
    return result
}