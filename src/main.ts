import {createFormConfig, getFields} from "./FormService";
import {fileTypeValidator, MIME_PDF, notEmpty, validName} from "./Validation";
import {PartialFormConfig} from "./Models";
import {DeepPartial, Dict} from "boost-web-core";
import {renderForm} from "./Renderer";

export let forObj= {
    name: 'John',
    email: 'john@gmail.com',
    password: '',
    confirmPassword: '',
    gender: 0,
    accountType: '',
    dateOfBirth: "2001-02-01",
    agreeToTerms: false,
    packages: ['newsLetter', 'premiumSupport'],
    comment: '',
    requestDiscount: 5.5,
    passportDocument: null,
    arrivalTime: '09:08:00',
    price: 50.99,
    volume: 50,
    age: 17,
    rating: 0,
    invalidTyped: null,
    answer: '',
    jsonInput: ''
};
export const options: PartialFormConfig = {
    readonly: false,
    noValidate: true,
    style: 'width: 50%; margin: 5px;',
    fields: {
        name: {validate: [notEmpty, validName], group: 'Personal Info'},
        email: {required: true, placeholder: 'mail@company.com', helpText: 'We will send you verification code through this', group: 'Personal Info'},
        accountType: {
            type: 'select',
            placeholder: '-- Select Account Type --',
            choices: ['Commercial', 'Personal'],
            onchange: e => {alert(' Changed to ' + (e.target as HTMLInputElement).value)}
        },
        gender: {
            type: 'radio', readonly: false,
            choices: [{key: 0, val: 'Male'}, {key: 1, val: 'Female'}], group: 'Personal Info'
        },
        comment: {type: 'textarea', colSpan: 2},
        passportDocument: {
            type: 'files', validate: [fileTypeValidator(MIME_PDF)],
            required: true, group: 'Personal Info'
        },
        volume: {type: "range", max: '1000', min: '0', step: '5', group: 'Feedback'},
        age: {
            validate: val => val < 18 ? 'You should be at least 18' : '', group: 'Personal Info'
        },
        agreeToTerms: {
            validate: val => val ? '' : 'You have to agree to our terms & conditions.'
        },
        rating: {
            type: 'rating', group: 'Feedback',
            validate: val => val < 2 ? 'Please, give a rating of at least 2' : ''
        },
        invalidTyped: {type: 'go'} as any,
        answer: {
            type: 'markdown', group: 'Feedback'
        },
        jsonInput: {type: 'sourcecode'}
    },
    validate: val => {
        if (val.password !== val.confirmPassword) {
            return {
                password: 'Does not match with confirm password.',
                confirmPassword: 'Does not match with password'
            } as any
        }
        return {}
    }
}

const root = document.getElementById('app')!

const formConfig = createFormConfig(forObj, {...options})
console.log('Generated Form Options', formConfig)

root.innerHTML = renderForm(forObj, formConfig)