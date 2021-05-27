import {createFormConfig} from "../FormService";
import {FieldConfig, FormValidationResult, WebForm} from '../Models'
import {getAbstractForm, renderInput, renderLabel} from "./VanillaFormRenderer";
import {RenderFormOptions} from "./Common";
import {toJsx} from "boost-web-core";

export interface ReactFormProps {
    forObject: any,
    options?: WebForm,
    renderOptions?: RenderFormOptions
    validationResult?: FormValidationResult
}

export function GetReactForm(createElement: any) {
    return ({forObject, options = undefined, renderOptions = undefined, validationResult = undefined}: ReactFormProps) => {
        const abstractForm = getAbstractForm(forObject, options, renderOptions, validationResult)
        return toJsx(createElement, abstractForm)
    }
}