import {createFormConfig, FieldConfigBase, FieldsConfig, WebForm} from "./FormService";

/**
 * Returns a react form component
 * @param createElement createElement
 * @param forObject
 * @param formConfig
 * @constructor
 */

export interface ReactFormProps {
    forObject: any,
    options?: WebForm
}

export function GetReactForm(createElement) {
    return ({forObject, options}: ReactFormProps) => {
        options = options || createFormConfig(forObject)
        const fields = Object.keys(options.fieldsConfig).map(k => options.fieldsConfig[k])
        return createElement("form", { id: "", onSubmit: e => alert('Submitted') },
            fields.map(field => createElement("div", {key: field.id},
                GetReactLabel(createElement, field),
                GetReactField(createElement, forObject[field.id], field)
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