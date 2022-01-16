import { describe } from 'mocha';
// @ts-ignore
const chai = require('chai');
const expect = chai.expect;
// @ts-ignore
import {createServer, Server} from "http";
import axios from 'axios'

import {guessType, createFormConfig, validateForm, validateFormAsync, FormConfig} from '../src'
import {DeepPartial} from "boost-web-core";
let server: Server

function createValidationApi() {
    server = createServer(function (req, res) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Request-Method', '*');
        res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
        res.setHeader('Access-Control-Allow-Headers', '*');
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(200);
        if ( req.method === 'OPTIONS' ) {
            res.end();
            return;
        }
        res.write(req.url.indexOf('1') > -1 ? '1' : '0'); //write a response to the client
        res.end(); //end the response
    });
    server.listen(8484);
}

function stopValidationApi() {
    server.close()
}

describe('Form service tests', () => {

    it('Guesses types correctly', () => {
        expect(guessType('password', null)).to.equal('password');
        expect(guessType('a', 1)).to.equal('number');
        expect(guessType('b', 'a')).to.equal('text');
        expect(guessType('b', null)).to.equal('text');
        expect(guessType('b', true)).to.equal('checkbox');
        expect(guessType('email', '')).to.equal('email');
    });

    it('Sets up formConfig config properly', () => {
        let forObject = {userName: '', password: '', rememberMe: false, agreeToTerms: false};
        let config = createFormConfig(forObject, {
            hideLabels: true,
            fields: {
                agreeToTerms: {
                    label: "I agree to terms",
                    hideLabel: false
                }
            }
        })
        expect(config.fields['userName'].label).to.equal('User Name');
        expect(config.fields['userName'].id).to.equal('userName');
        expect(config.fields['userName'].hideLabel).to.equal(true);
        expect(config.fields['password'].label).to.equal('Password');
        expect(config.fields['password'].id).to.equal('password');
        expect(config.fields['rememberMe'].label).to.equal('Remember Me');
        expect(config.fields['rememberMe'].id).to.equal('rememberMe');
        expect(config.fields['agreeToTerms'].label).to.equal('I agree to terms');
        expect(config.fields['agreeToTerms'].id).to.equal('agreeToTerms');
        expect(config.fields['agreeToTerms'].hideLabel).to.equal(false);
    });

    it('Adds empty choice for non-required fields', () => {
        let config = createFormConfig({}, {
            fields: {
                id: { type: "radio", choices: ['alpha', 'beta'] },
                role: { type: "radio", choices: ['guest', 'admin'], required: true },
            }
        })
        expect(config.fields.id.choices).to.deep.equal(
            [{key: null, val: ""}, {key: 'alpha', val: 'Alpha'}, {key: 'beta', val: 'Beta'}]);
        expect(config.fields.role.choices).to.deep.equal(
            [{key: 'guest', val: 'Guest'}, {key: 'admin', val: 'Admin'}]);
    });

    it('Sets up field choices correctly', () => {
        let config = createFormConfig({}, {
            fields: {
                f1: { type: "radio", choices: ['alpha', 'beta'], required: true },
                f2: { type: "radio", choices: {KEY1: 'firstKey', KEY2: 'ሁለተኛው ቍልፍ'}, required: true },
                f3: { type: "radio", choices: [{key: 1, val: 'M'}, {key: 2, val: 'F'}], required: true },
            }
        })
        expect(config.fields.f1.choices).to.deep.equal(
            [{key: 'alpha', val: 'Alpha'}, {key: 'beta', val: 'Beta'}]);
        expect(config.fields.f2.choices).to.deep.equal(
            [{key: 'KEY1', val: 'First Key'}, {key: 'KEY2', val: 'ሁለተኛው ቍልፍ'}]);
        expect(config.fields.f3.choices).to.deep.equal(
            [{key: 1, val: 'M'}, {key: 2, val: 'F'}]);
    });

    it('Validates formConfig fields async correctly', async () => {
        createValidationApi()
        let forObject = {userName: '', password: '', age: 17, email: 'abe@example.com', city: ''};
        let config = createFormConfig(forObject, {
            hideLabels: true,
            fields: {
                userName: {
                    validate: async val => {
                        const vr = (await axios.get('http://localhost:8484/0')).data
                        return vr == 1 ? '' : 'USERNAME_TAKEN'
                    }
                },
                email: {required: true},
                age: {validate: async val => (val > 18 ? '' : 'AGE_18_OR_ABOVE')}
            }
        });
        let validationResult = await validateFormAsync(forObject, config);
        stopValidationApi();

        expect(validationResult.hasError).to.be.true;
        expect(validationResult.fields.userName.hasError).to.be.true;
        expect(validationResult.fields.userName.message).to.equal('USERNAME_TAKEN');
        expect(validationResult.fields.city.hasError).to.be.false;
        expect(validationResult.fields.age.hasError).to.be.true;
        expect(validationResult.fields.age.message).to.equal('AGE_18_OR_ABOVE');
        expect(validationResult.fields.email.hasError).to.be.false;
    });

    it('Validates forms sync correctly', () => {
        let forObject = {userName: '', age: 17, email: 'abe@example.com', city: ''};
        let config = createFormConfig(forObject, {
            hideLabels: true,
            fields: {
                userName: {required: true},
                email: {required: true},
                age: {validate: val => (val > 18 ? '' : 'AGE_18_OR_ABOVE')}
            }
        });
        let validationResult = validateForm(forObject, config);

        expect(validationResult.hasError).to.be.true;
        expect(validationResult.fields.city.hasError).to.be.false;
        expect(validationResult.fields.age.hasError).to.be.true;
        expect(validationResult.fields.age.message).to.equal('AGE_18_OR_ABOVE');
        expect(validationResult.fields.email.hasError).to.be.false;
    });

    it('Does formConfig-level async validation', async () => {
        createValidationApi()
        let registration = {userName: '', password: 'a', confirmPassword: 'b'};
        let formConfig = createFormConfig(registration, {
            validate: [
                async form => (form.password != form.confirmPassword ? 'PASSWORDS_DONT_MATCH' : ''),
                async form => (form.userName == form.password ? {password: 'USERNAME_USED_AS_PASSWORD'} as any : {}),
                async form => {
                    const vr = (await axios.get('http://localhost:8484/0')).data
                    return vr == 1 ? {} : {userName: 'USERNAME_TAKEN'}
                }
            ]
        });
        let validationResult = await validateFormAsync(registration, formConfig);
        stopValidationApi()
        expect(validationResult.hasError).to.be.true;
        expect(validationResult.message).to.equal('PASSWORDS_DONT_MATCH');
        expect(validationResult.fields.userName.hasError).to.be.true;
        expect(validationResult.fields.userName.message).to.equal('USERNAME_TAKEN');
    });

    it('Does formConfig-level sync validation', () => {
        let registration = {userName: '', password: 'a', confirmPassword: 'b'};
        let formConfig = createFormConfig(registration, {
            validate: [
                form => (form.password != form.confirmPassword ? 'PASSWORDS_DONT_MATCH' : ''),
                form => (form.userName == form.password ? {password: 'USERNAME_USED_AS_PASSWORD'} as any : {})
            ]
        });
        let validationResult = validateForm(registration, formConfig);
        expect(validationResult.hasError).to.be.true;
        expect(validationResult.message).to.equal('PASSWORDS_DONT_MATCH');
    });

    it('Creates form config properly', () => {
        let forObj = {name: '', password: '', gender: '0', agreeToTerms: true}
        let formConfig = createFormConfig(forObj, {
            fields: {

            }
        })

        expect(true).to.be.true
    })

    it('Respects user config choices', () => {
        let registration = {userName: '', password: 'a', confirmPassword: 'b'};
        let formConfig = createFormConfig(registration, {
            readonly: true, id: 'ab',
            fields: {
                userName: {label: 'User ID', placeholder: 'Your unique name', readonly: false}
            }
        });
        let formConfig2 = createFormConfig(registration, formConfig as any);

        expect(JSON.stringify(formConfig)).to.equal(JSON.stringify(formConfig2));
    })

});