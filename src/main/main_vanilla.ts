import {createFormConfig, validateForm} from "../FormService";
import {getFormValue, renderForm} from "../renderers/VanillaFormRenderer";
import {fileTypeValidator, imgTypeFile, MIME_PDF, notEmpty, validName} from "../Validation";
import {forObj, options, renderOptions} from "./main_common";
import {getFormValidationResult} from "../Models";
import {AbstractForm} from "../components/AbstractForm";
import {renderToDom, h, withState} from "vdtree";

const root = document.getElementById('app')!
const onSubmit = (e: Event) => {
    let state = getFormValue(config, e.target as HTMLElement)
    formValidationResult = validateForm(state, config)
    if (formValidationResult.hasError) {
        e.preventDefault()
        //reRenderForm(state)
    }
}
console.log('Generated Form Options', createFormConfig(forObj, options))
let formValidationResult = getFormValidationResult()
let config = createFormConfig(forObj, {...options, onsubmit: onSubmit})

renderForm(forObj, root, config)