import {createFormConfig} from "../FormService";
import {FieldConfig, FieldsConfig, FormValidationResult, WebForm} from '../Models'
import {getAbstractForm, renderInput, renderLabel} from "./VanillaFormRenderer";
import {RenderFormOptions} from "./Common";
import {DeepPartial, toJsx} from "boost-web-core";

export interface ReactFormProps extends DeepPartial<WebForm> {
    forObject: any,
    renderOptions?: RenderFormOptions
    validationResult?: FormValidationResult
}

export function GetReactForm(createElement: any) {
    return (props: ReactFormProps): any => {
        let {
            forObject,
            renderOptions,
            validationResult = {hasError: false, message: '', fields: {}}
        } = props
        let formConfig = {
            ...props,
            forObject: undefined,
            validationResult: undefined,
            renderOptions: undefined
        }
        const abstractForm = getAbstractForm(forObject, formConfig, renderOptions, validationResult)
        return toJsx(createElement, abstractForm)
    }
}