import {createFormConfig, validateForm} from "../FormService";
import {getFormValue, renderForm} from "../renderers/VanillaFormRenderer";
import {fileTypeValidator, imgTypeFile, MIME_PDF, notEmpty, validName} from "../Validation";
import {forObj, options, renderOptions} from "./main_common";
import {getFormValidationResult} from "../Models";
import {AbstractForm} from "../components/AbstractForm";
import {renderToDom, h, withState} from "vdtree";

const root = document.getElementById('app')!
const onSubmit = (e: Event) => {
    e.preventDefault()
    alert('Submitted')
}
console.log('Generated Form Options', createFormConfig(forObj, options))

let config = createFormConfig(forObj, {...options, onsubmit: e => alert('Submitted.')})

renderForm(forObj, root, config)