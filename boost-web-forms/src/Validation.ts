import {FormValidationResult, ValidateFunc} from "./Models";
import {getFriendlyFileSize, isEmpty} from "boost-web-core";


const special_char_regex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/

export const MIME_IMAGES = ['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml', 'image/webp', 'image/bmp', 'image/tiff']
export const MIME_VIDEO = ['video/mp4', 'video/webv', 'video/ogv']
export const MIME_AUDIO = ['audio/mpeg', 'audio/ogg', 'audio/x-m4a', 'audio/3gpp']
export const MIME_PDF = ['application/pdf']
export const MIME_MS_EXCEL = ['vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
export const MIME_MS_WORD = ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']


export function notEmpty(val, errorMessage = 'Please, fill out this field.') {
    if (val?.constructor === FileList && val.length == 0)
        return errorMessage;
    return isEmpty(val) ? errorMessage : '';
}

export function validName(val, errorMessage = 'Please, enter a valid name.') {
    if (/[<>/\\{}*#~`%]+$/.test(val)) return errorMessage;
    return '';
}

export function getMinLenValidator(length = 1): ValidateFunc {
    return val => {
        if (isEmpty(val))
            return 'Please, fill out this field.'
        else if (val.length < length)
            return `Should have at least ${length} characters.`
        return ''
    }
}

export function fileTypeValidator(fileMimeList: string[], errorMessage = 'Please, upload valid files only.') {
    return (val) => {
        const fileList = [...(val as FileList)]
        if (fileList.length == 0)
            return ''
        if (fileList.find(f => fileMimeList.indexOf(f.type) == -1) != null)
            return errorMessage
        return ''
    }
}

export function imgTypeFile(errorMessage = 'Please, upload images only') {
    return fileTypeValidator(MIME_IMAGES, errorMessage)
}

export function getStrongPasswordValidator({minLength = 8, specialChars = true} = {}) {
    return val => {
        if (isEmpty(val))
            return 'Please, fill out this field.'
        else if (val.length < minLength)
            return`Password should have at least ${minLength} characters.`
        else if (val.toLowerCase() === val || val.toUpperCase() === val)
            return 'Password should have at least 1 capital and 1 small letter.'
        else if (specialChars && !special_char_regex.test(val))
            return 'Password should have at least one special character (*!@#$%^&*).'
        return ''
    }
}

export function maxFileSize(val, errorMessage = 'Please, upload a file no bigger than {0}', maxUploadFileSize = 1024*1024*10) {
    if ([...val as FileList].find(f => f.size > maxUploadFileSize) != null)
        return errorMessage.replace('{0}', getFriendlyFileSize(maxUploadFileSize));
    return ''
}

export async function parseApiValidationResult(apiResult) {
    let result : FormValidationResult = {
        hasError: false,
        message: '',
        fields: {}
    };
    if (apiResult && apiResult.code === 'ValidationError' && apiResult.details) {
        let keys = Object.keys(apiResult.details)
        for (let i=0; i<keys.length; i++) {
            let fieldId = keys[i]
            if (apiResult.details[fieldId].length) {
                result.hasError = true
                fieldId = fieldId.slice(0, 1).toLowerCase() + fieldId.slice(1)
                result.fields[fieldId] = {
                    hasError: true,
                    message: 'Please, check this input'
                }
            }
        }
    }
    return result;
}