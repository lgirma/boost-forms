import {createFormConfig} from "../FormService";
import {fileTypeValidator, MIME_PDF, notEmpty, validName} from "../Validation";
import {RenderFormOptions} from "../renderers/Common";
import {Bootstrap5, Bulma, MaterialDesignLite, Bootstrap4} from "../renderers/Plugins";

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
    arrivalTime: '09:08:00',
    price: 50.99
};
export const options = createFormConfig(forObj, {
    readonly: false,
    style: 'width: 50%; margin: 10px' as any,
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
        },
        arrivalTime: {type: 'go'} as any
    },
    validate: val => (val.password !== val.confirmPassword ? 'Passwords do not match.' : '')
})

export const renderOptions: RenderFormOptions = {
    ...Bootstrap4
}