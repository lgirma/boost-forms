import { describe } from 'mocha';
// @ts-ignore
const chai = require('chai');
const expect = chai.expect;
// @ts-ignore
import {createServer, Server} from "http";
import axios from 'axios'

import {
    createFormConfig,
    validateForm,
    registerPlugin,
    getFormHtmlAttrs, getFieldHtmlAttrs, addValidation
} from '../src'

registerPlugin([
{
        name: 'TypeGuesser',
        hooks: {
            onTypeGuess: (fieldId, fieldValue) => {
                if (fieldValue != null && fieldValue.toString().indexOf('#') == 0)
                    return 'shell'
                return null
            }
        }
    },
    {
        name: 'FormSecurity',
        hooks: {
            onCreateFormConfig: formConfig => {
                if (formConfig.fieldsConfig.userName != null && formConfig.fieldsConfig.password != null)
                    formConfig.id = 'form-secure'
            }
        }
    },
    {
        name: 'PasswordHash',
        hooks: {
            onCreateFieldConfig: (fieldConfig, formConfig) => {
                if (fieldConfig.type == 'password') {
                    fieldConfig.title = 'Secret'
                }
            }
        }
    },
    {
        name: 'StrongPassword',
        hooks: {
            onCreateFieldConfig: (fieldConfig, formConfig) => {
                if (fieldConfig.type == 'password') {
                    addValidation(fieldConfig, password => password.length < 5 ? 'WEAK_PASSWORD' : '')
                }
            }
        }
    },
    {
        name: 'FormOnClick',
        hooks: {
            onGetFormHtmlAttrs: (formConfig, result) => {
                if (result.onclick)
                    result.onClick = result.onclick
            }
        }
    },
    {
        name: 'FieldOnClick',
        hooks: {
            onGetFieldHtmlAttrs: (fieldConfig, result) => {
                if (result.onclick)
                    result.onClick = result.onclick
            }
        }
    }
])

describe('Form plugin system tests', () => {

    it('Type guessing plugins work', () => {
        let config = createFormConfig({someField: 'a', script: '# go'})
        expect(config.fieldsConfig.script.type).to.be.equal('shell')
        expect(config.fieldsConfig.someField.type).to.be.equal('text')
    });

    it('Form config hooks work', () => {
        let config = createFormConfig({userName: '', password: ''})
        expect(config.id).to.be.equal('form-secure')
    });

    it('Field config hooks work', () => {
        let form = {userName: '', password: '12'}
        let config = createFormConfig(form)
        expect(config.fieldsConfig.password.title).to.be.equal('Secret')
        expect(config.fieldsConfig.userName.title).to.be.equal(undefined)
        let vr = validateForm(form, config)
        expect(vr.hasError).to.equal(true)
        expect(vr.fields.password.hasError).to.equal(true)
        expect(vr.fields.password.message).to.equal('WEAK_PASSWORD')
    });

    it('Form HTML attrs hooks work', () => {
        let config = createFormConfig(
            {userId: '', password: ''}, {
                onclick: e => alert(e),
                onblur: e => alert(e)
            })
        let htmlAttrs = getFormHtmlAttrs(config)
        expect(htmlAttrs.onClick).to.be.not.equal(undefined)
        expect(htmlAttrs.onBlur).to.be.equal(undefined)
    });

    it('Field HTML attrs hooks work', () => {
        let config = createFormConfig(
            {userId: '', password: ''}, { fieldsConfig: {
                userId: {
                    onclick: e => alert(e),
                    onblur: e => alert(e)
                }
            }
        })
        let htmlAttrs = getFieldHtmlAttrs(config.fieldsConfig.userId)
        expect(htmlAttrs.onClick).to.be.not.equal(undefined)
        expect(htmlAttrs.onBlur).to.be.equal(undefined)
    });

});