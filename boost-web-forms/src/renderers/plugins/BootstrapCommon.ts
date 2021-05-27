import {FieldConfig, FormValidationResult, ValidationResult, WebForm} from "../../Models";
import {LayoutRenderer, PluginOptions} from "../Common";
import {AbstractDomElement} from "boost-web-core";

export const BootstrapCommonLayout = {
    formLayout(forObject: any, form: WebForm, renderer: LayoutRenderer, validationResult?: FormValidationResult,
               pluginOptions?: Partial<PluginOptions>): AbstractDomElement {
        validationResult ??= {hasError: false, message: '', fields: {}}
        const result = renderer.form(form, {class: 'row'})
        for (const [fieldId, field] of Object.entries(form.fieldsConfig!)) {
            result.children!.push(this.renderFieldSet(field, forObject[fieldId], renderer, validationResult.fields[fieldId], pluginOptions))
        }
        return result;
    },
    renderFieldSet(field: FieldConfig, fieldValue: any, renderer: LayoutRenderer,
                   validationResult?: ValidationResult, pluginOptions?: Partial<PluginOptions>): AbstractDomElement {
        return {} as AbstractDomElement
    },
    getColClass(columns: number, colSpan: number, prefix = 'col-') {
        return columns > 1 ? `${prefix}${12 * colSpan / columns}` : ''
    }
}