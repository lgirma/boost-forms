import {createFormConfig} from "../FormService";
import {getFormValue, renderForm} from "../renderers/VanillaFormRenderer";
import {forObj, options} from "./main_common";

const root = document.getElementById('app')!

const formConfig = createFormConfig(forObj, {...options, onsubmit: onSubmit})
function onSubmit(e: Event) {
    e.preventDefault()
    alert('Submitting ' + JSON.stringify(getFormValue(formConfig)))
}
console.log('Generated Form Options', formConfig)
renderForm(forObj, root, formConfig)