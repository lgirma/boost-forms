import { FormValidationResult, FormFieldType, FieldConfig, FormConfig } from "../Models";
import { OneOrMany } from "boost-web-core";
import {AbstractDomElement, AbstractDomNode} from "vdtree";

/*export interface PluginOptions {
    columns: number
    isInline?: boolean
    isHorizontal?: boolean
}*/

export const SimpleTextTypes : FormFieldType[] = [
    'text', 'password', 'date', 'datetime-local', 'email', 'search', 'url', 'time', 'month', 'week', 'tel'
]