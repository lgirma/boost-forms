import {AbstractDomElement, h} from 'vdtree'
import {FormConfig, FormValidationResult} from "../Models";
import {getHtmlFormAttrs} from "../renderers/Common";
import {AbstractInput} from "./AbstractInput";
import {AbstractLabel} from "./AbstractLabel";
import {Dict, toArray} from "boost-web-core";

export interface AbstractFormProps {
    forObject: any,
    formConfig: FormConfig,
    validationResult?: FormValidationResult
    htmlAttrs?: any
}

export function AbstractForm({forObject, formConfig, validationResult, htmlAttrs = {}}: AbstractFormProps): AbstractDomElement {
    let result = h(formConfig.excludeSubmitButton ? 'div' : 'form',
        {...getHtmlFormAttrs(formConfig), ...htmlAttrs})
    for (const fieldId in formConfig.fieldsConfig) {
        if (!formConfig.fieldsConfig.hasOwnProperty(fieldId))
            continue
        let field = formConfig.fieldsConfig[fieldId]
        let fieldSet = h('div', {})
        const fieldValidationResult = validationResult?.fields[fieldId] ?? {hasError: false}
        let input = AbstractInput({field, value: forObject[fieldId]})
        let label = AbstractLabel({field})

        if (field.type === 'radio') {
            input = Object.keys(field.choices as {})
                .map((k, i) => h('label', {}, [
                    input[i],
                    ' ',
                    (field.choices as Dict<string>)[k]
                ]))
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