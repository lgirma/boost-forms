import '../../style.css'
import {createFormConfig} from "../FormService";
import {renderForm} from "../renderers/VanillaFormRenderer";
import {fileTypeValidator, imgTypeFile, MIME_PDF, notEmpty, validName} from "../Validation";
import {forObj, options} from "./main_common";

console.log(options)
document.querySelector('#app').appendChild(renderForm(forObj, options))
