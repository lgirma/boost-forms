import {createFormConfig} from "../FormService";
import {fileTypeValidator, MIME_PDF, notEmpty, validName} from "../Validation";
import {RenderFormOptions} from "../renderers/Common";
import {Bootstrap5, Bootstrap4, Bootstrap3/*, PropertyGrid, Bootstrap3, Bulma, MDB5*/} from "../renderers/plugins";
import {FormValidationResult, FormConfig} from "../Models";
import {DeepPartial, Dict} from "boost-web-core";

export let forObj= {
    //@field({type: 'tel'})
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: '0',
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
    invalidTyped: null
};
export const options: DeepPartial<FormConfig> = {
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
        age: {
            validate: val => val < 18 ? 'You should be at least 18' : ''
        },
        agreeToTerms: {
            validate: val => val ? '' : 'You have to agree to our terms & conditions.'
        },
        rating: {
            type: 'rating',
            validate: val => val < 2 ? 'Please, give a rating of at least 2' : ''
        },
        invalidTyped: {type: 'go'} as any
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

export const renderOptions: RenderFormOptions = {
    //...Bootstrap4({columns: 2})
}