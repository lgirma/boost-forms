import {h, toReactComponent, toReactElement} from "vdtree";
import {FieldConfig, FieldsConfig, FormValidationResult, FormConfig, getFormValidationResult} from '../Models'
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
        let formConfig = props.$$isComplete
            ? {...props, forObject: undefined, validationResult: undefined} as FormConfig
            : createFormConfig(forObject, {...props, forObject: undefined, validationResult: undefined})
        if (formConfig.autoValidate) {
            const [vr, setVr] = React.useState(getFormValidationResult()) as [FormValidationResult, () => void]
            return toReactElement(AbstractForm({forObject, formConfig, validationResult: vr}), React)
        }
        return toReactElement(AbstractForm({forObject, formConfig, validationResult}), React)
    }
}