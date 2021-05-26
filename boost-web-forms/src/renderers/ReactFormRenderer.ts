import {createFormConfig} from "../FormService";
import {FieldConfigBase, FormValidationResult, WebForm} from '../Models'
import {getAbstractForm, renderInput, renderLabel} from "./VanillaFormRenderer";
import {RenderFormOptions} from "./Common";
import {toJsx} from "boost-web-core";

export interface ReactFormProps {
    forObject: any,
    options?: WebForm,
    renderOptions?: RenderFormOptions
    validationResult?: FormValidationResult
}

export function GetReactForm(createElement) {
    return ({forObject, options = null, renderOptions = null, validationResult = null}: ReactFormProps) => {
        const abstractForm = getAbstractForm(forObject, options, renderOptions, validationResult)
        return toJsx(createElement, abstractForm)
    }
}