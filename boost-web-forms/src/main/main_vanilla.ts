import {createFormConfig, validateForm} from "../FormService";
import {getFormValue, renderForm} from "../renderers/VanillaFormRenderer";
import {fileTypeValidator, imgTypeFile, MIME_PDF, notEmpty, validName} from "../Validation";
import {forObj, options, renderOptions} from "./main_common";
import {VALID_FORM} from "../Models";


const onSubmit = (e: Event) => {
    let state = getFormValue(config, e.target as HTMLElement)
    formValidationResult = validateForm(state, config)
    if (formValidationResult.hasError) {
        e.preventDefault()
        reRenderForm(state)
    }
}
console.log('Generated Form Options', createFormConfig(options))
let formValidationResult = {...VALID_FORM}
let config = createFormConfig(forObj, {...options, onsubmit: onSubmit})

function reRenderForm(state) {
    const root = document.querySelector('#app')!
    root.innerHTML = ''
    root.appendChild(renderForm(state, config, formValidationResult, renderOptions))
}

reRenderForm(forObj)