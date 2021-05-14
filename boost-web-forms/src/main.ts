import '../style.css'
import {createForm} from "./FormService";
import {renderFormVanilla} from "./VanillaFormRenderer";
import {fileTypeValidator, imgTypeFile, MIME_PDF} from "./Validation";

let forObject = {
    name: '',
    email: '',
    password: '',
    gender: 0,
    confirmPassword: '',
    accountType: '',
    dateOfBirth: "2001-02-01",
    receiveNewsletter: false,
    comment: '',
    requestDiscount: 5.5,
    passportDocument: null
};
const form = createForm(forObject, {
    readonly: false,
    fieldsConfig: {
        password: {required: true},
        email: {required: true, placeholder: 'mail@company.com'},
        confirmPassword: {type: 'password'},
        dateOfBirth: {type: 'date'},
        accountType: {
            type: 'select',
            placeholder: '-- Select Account Type --',
            selectOptions: {
                options: ['Commercial', 'Personal'],
            }
        },
        gender: {
            type: 'radio',
            selectOptions: {
                options: {0: 'Male', 1: 'Female'}
            }
        },
        comment: {type: 'textarea'},
        passportDocument: {
            type: 'file', validate: [fileTypeValidator(MIME_PDF)],
            required: true
        }
    },
    validate: val => (val.password != val.confirmPassword ? 'Passwords do not match.' : '')
})
document.querySelector('#app').innerHTML = `
    <h3>Registration</h3>
    ${renderFormVanilla(forObject, form)}
    <div>
        <button type="button">Register</button>
    </div>
`
