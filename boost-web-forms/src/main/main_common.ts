import {createFormConfig} from "../FormService";
import {fileTypeValidator, MIME_PDF, notEmpty, validName} from "../Validation";
import {RenderFormOptions} from "../renderers/Common";
import {Bootstrap5, Bootstrap4, Bootstrap3/*, PropertyGrid, Bootstrap3, Bulma, MDB5*/} from "../renderers/plugins";
import {FormValidationResult} from "../Models";

export let forObj= {
    //@field({type: 'tel'})
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: '0',
    accountType: '',
    dateOfBirth: "2001-02-01",
    receiveNewsletter: false,
    packages: ['newsLetter', 'premiumSupport'],
    comment: '',
    requestDiscount: 5.5,
    passportDocument: null,
    arrivalTime: '09:08 PM',
    price: 50.99,
    volume: 50,
    fiscalYear: 2005,
    invalidTyped: null
};
export const options = createFormConfig(forObj, {
    readonly: false,
    style: { width: '50%', margin: '10px' },
    fieldsConfig: {
        name: {validate: [notEmpty, validName]},
        email: {required: true, placeholder: 'mail@company.com', helpText: 'We will send you verification code through this'},
        accountType: {
            type: 'select',
            placeholder: '-- Select Account Type --',
            choices: ['Commercial', 'Personal'],
            onchange: e => {alert(' Changed to ' + (e.target as HTMLInputElement).value)}
        },
        gender: {
            type: 'radio', readonly: false,
            choices: {0: 'Male', 1: 'Female'}
        },
        comment: {type: 'textarea', colSpan: 2},
        passportDocument: {
            type: 'files', validate: [fileTypeValidator(MIME_PDF)],
            required: true
        },
        volume: {type: "range", max: '1000', min: '0', step: '5'},
        invalidTyped: {type: 'go'} as any
    },
    validate: val => (val.password !== val.confirmPassword ? 'Passwords do not match.' : '')
})

export const renderOptions: RenderFormOptions = {
    ...Bootstrap4({columns: 2})
}

export const formValidationResult: FormValidationResult = {
    hasError: true,
    fields: {
        volume: {hasError: true, message: 'Loud sound might hurt you.'},
        price: {hasError: true, message: 'Price is too low.'},
        receiveNewsletter: {hasError: true, message: 'Please receive it.'},
        accountType: {hasError: true, message: 'Please select one that applies.'},
        gender: {hasError: true, message: 'Please select one gender'}
    }
}