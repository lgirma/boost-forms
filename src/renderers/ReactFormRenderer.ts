import {h, toReactComponent} from "vdtree";
import {FieldConfig, FieldsConfig, FormValidationResult, FormConfig} from '../Models'
import {RenderFormOptions} from "./Common";
import {DeepPartial} from "boost-web-core";
import {AbstractForm} from "../components/AbstractForm";
import {createFormConfig} from "../FormService";

export interface ReactFormProps extends DeepPartial<FormConfig> {
    forObject: any,
    validationResult?: FormValidationResult
}

export function GetReactForm(React: any) {
    return (props: ReactFormProps): any => {
        let {
            forObject,
            validationResult = {hasError: false, message: '', fields: {}}
        } = props
        let formConfig = {
            ...props,
            forObject: undefined,
            validationResult: undefined,
            renderOptions: undefined
        }
        const abstractForm = AbstractForm({forObject, formConfig: createFormConfig(formConfig), validationResult})
        return toReactComponent(abstractForm, React)
    }
}