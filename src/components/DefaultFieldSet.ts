import {FieldConfig, ValidationResult} from "../Models";
import {AbstractDomElement, h} from "vdtree";
import {AbstractInput} from "./AbstractInput";
import {AbstractLabel} from "./AbstractLabel";
import {Dict, toArray} from "boost-web-core";

export interface FieldSetLayoutProps {
    field: FieldConfig
    value: any
    validationResult?: ValidationResult
}

export function DefaultFieldSet({field, value, validationResult}: FieldSetLayoutProps): AbstractDomElement {
    const fieldSet = h('div', {})
    let input = AbstractInput({field, value, validationResult})
    let label = AbstractLabel({field, validationResult})

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

    if (validationResult?.hasError)
        fieldSet.children.push(h('div', {style: {color: 'red'}},
            h('small', {}, validationResult.message)))

    return fieldSet
}