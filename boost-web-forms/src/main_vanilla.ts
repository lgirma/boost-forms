import '../style.css'
import {createFormConfig} from "./FormService";
import {renderForm} from "./VanillaFormRenderer";
import {fileTypeValidator, imgTypeFile, MIME_PDF, notEmpty, validName} from "./Validation";

let forObject = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: 0,
    accountType: '',
    dateOfBirth: "2001-02-01",
    receiveNewsletter: false,
    packages: ['newsLetter', 'premiumSupport'],
    comment: '',
    requestDiscount: 5.5,
    passportDocument: null
};
const form = createFormConfig(forObject, {
    readonly: false,
    fieldsConfig: {
        name: {validate: [notEmpty, validName]},
        email: {required: true, placeholder: 'mail@company.com'},
        accountType: {
            type: 'select',
            placeholder: '-- Select Account Type --',
            choices: ['Commercial', 'Personal']
        },
        gender: {
            type: 'radio', readonly: false,
            choices: {0: 'Male', 1: 'Female'}
        },
        comment: {type: 'textarea'},
        passportDocument: {
            type: 'files', validate: [fileTypeValidator(MIME_PDF)],
            required: true
        }
    },
    validate: val => (val.password != val.confirmPassword ? 'Passwords do not match.' : '')
})
console.log(form)
document.querySelector('#app').appendChild(renderForm(forObject, form))
