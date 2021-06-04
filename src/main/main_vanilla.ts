import {createFormConfig, validateForm} from "../FormService";
import {getFormValue, renderForm, updateForm} from "../renderers/VanillaFormRenderer";
import {fileTypeValidator, imgTypeFile, MIME_PDF, notEmpty, validName} from "../Validation";
import {forObj, options, renderOptions} from "./main_common";
import {getFormValidationResult} from "../Models";
// @ts-ignore
import {DiffDOM} from "diff-dom";
const dd = new DiffDOM({valueDiffing: false});


const onSubmit = (e: Event) => {
    let state = getFormValue(config, e.target as HTMLElement)
    formValidationResult = validateForm(state, config)
    if (formValidationResult.hasError) {
        e.preventDefault()
        reRenderForm(state)
    }
}
console.log('Generated Form Options', createFormConfig(options))
let formValidationResult = getFormValidationResult()
let config = createFormConfig(forObj, {...options, onsubmit: onSubmit})

function reRenderForm(state) {
    const root = document.querySelector('#app')!
    const newForm = renderForm(state, config, formValidationResult, renderOptions)
    updateForm((dest, src) => dd.apply(dest, dd.diff(dest, src)), root, newForm)
    /*root.innerHTML = ''
    root.appendChild(renderForm(state, config, formValidationResult, renderOptions))*/
}

reRenderForm(forObj)