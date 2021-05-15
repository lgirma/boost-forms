import {FieldConfigBase, FieldsConfig, WebForm} from "./FormService";

/**
 * Returns a react form component
 * @param createElement createElement
 * @param forObject
 * @param formConfig
 * @constructor
 */

export interface ReactFormProps {
    forObject: any,
    formConfig: WebForm
}

export function GetReactFormComponent(createElement) {
    return (props: ReactFormProps) => {
        const fields = Object.keys(props.formConfig.fieldsConfig).map(k => props.formConfig.fieldsConfig[k])
        return createElement("form", { id: "", onSubmit: e => alert('Submitted') },
            fields.map(field => createElement("div", {key: field.id},
                GetReactLabel(createElement, field),
                GetReactField(createElement, props.forObject[field.id], field)
            )),
            createElement("div", null, createElement("input", {
                type: "submit",
                value: "Submit"
            }))
        );
    }
}

function GetReactField(createElement, val, field: FieldConfigBase) {
    return createElement("input", {
        type: field.type,
        name: field.id,
        id: field.id,
        value: val
    })
}

function GetReactLabel(createElement, field: FieldConfigBase) {
    return createElement("label", { htmlFor: field.id }, field.label)
}