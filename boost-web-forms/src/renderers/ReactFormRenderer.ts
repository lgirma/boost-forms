import {createFormConfig} from "../FormService";
import {FieldConfigBase, WebForm} from '../Models'
import {getAbstractForm, renderInput, renderLabel} from "./VanillaFormRenderer";
import {RenderFormOptions} from "./Common";
import {toJsx} from "boost-web-core";

export interface ReactFormProps {
    forObject: any,
    options?: WebForm,
    renderOptions?: RenderFormOptions
}

export function GetReactForm(createElement) {
    return ({forObject, options = null, renderOptions = null}: ReactFormProps) => {
        const abstractForm = getAbstractForm(forObject, options, null, renderOptions)
        return toJsx(createElement, abstractForm)
    }
}