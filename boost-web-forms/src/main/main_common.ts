import {createFormConfig} from "../FormService";
import {fileTypeValidator, MIME_PDF, notEmpty, validName} from "../Validation";
import {RenderFormOptions} from "../renderers/Common";
import {Bootstrap5, PropertyGrid, Bootstrap4, Bootstrap3, Bulma/*, MDB5*/} from "../renderers/Plugins";
import {FormValidationResult} from "../Models";

export let forObj= {
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        birthDate: '',
        packages: ['newsLetter', 'premiumSupport'],
        preferredTime: '00:00:00'
};
export const options = {

}

export const renderOptions: RenderFormOptions = {
    //...Bootstrap5({columns: 2})
}

export const formValidationResult: FormValidationResult = {
    hasError: true,
    fields: {
        volume: {hasError: true, message: 'Loud sound might hurt you.'},
        price: {hasError: true, message: 'Price is too low.'},
        receiveNewsletter: {hasError: true, message: 'Please receive it.'},
        accountType: {hasError: true, message: 'Please select one that applies.'}
    }
}