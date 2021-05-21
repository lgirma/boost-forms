import {createFormConfig} from "../FormService";
import {FieldConfigBase, WebForm} from '../Models'
import {renderField, renderLabel} from "./VanillaFormRenderer";

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
    let fieldHTML = renderField(val, field)
    return createElement("span", {dangerouslySetInnerHTML: {__html: (typeof fieldHTML == 'string' ? fieldHTML : fieldHTML.outerHTML)}})
}

function GetReactLabel(createElement, field: FieldConfigBase) {
    let fieldLabel = renderLabel(field)
    return createElement("span", {dangerouslySetInnerHTML: {__html: (typeof fieldLabel == 'string' ? fieldLabel : fieldLabel.outerHTML)}})
}