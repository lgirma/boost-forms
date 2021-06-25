import {createFormConfig, validateForm} from "../FormService";
import {getFormValue, renderForm} from "../renderers/VanillaFormRenderer";
import {fileTypeValidator, imgTypeFile, MIME_PDF, notEmpty, validName} from "../Validation";
import {forObj, options} from "./main_common";
import {getFormValidationResult} from "../Models";
import {AbstractForm} from "../components/AbstractForm";
import {renderToDom, h, withState} from "vdtree";

const root = document.getElementById('app')!

const formConfig = createFormConfig(forObj, {...options, onsubmit: onSubmit})
function onSubmit(e: Event) {
    e.preventDefault()
    alert('Submitting ' + JSON.stringify(getFormValue(formConfig)))
}
console.log('Generated Form Options', formConfig)
renderForm(forObj, root, formConfig)