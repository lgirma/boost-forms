import { describe } from 'mocha';
// @ts-ignore
const chai = require('chai');
const expect = chai.expect;
// @ts-ignore
import {createServer, Server} from "http";
import axios from 'axios'

import {guessType, createFormConfig, validateForm, validateFormAsync} from '../src/FormService'
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
            fieldsConfig: {
                agreeToTerms: {
                    label: "I agree to terms",
                    hideLabel: false
                }
            }
        })
        expect(config.fieldsConfig['userName'].label).to.equal('User Name');
        expect(config.fieldsConfig['userName'].id).to.equal('userName');
        expect(config.fieldsConfig['userName'].hideLabel).to.equal(true);
        expect(config.fieldsConfig['password'].label).to.equal('Password');
        expect(config.fieldsConfig['password'].id).to.equal('password');
        expect(config.fieldsConfig['rememberMe'].label).to.equal('Remember Me');
        expect(config.fieldsConfig['rememberMe'].id).to.equal('rememberMe');
        expect(config.fieldsConfig['agreeToTerms'].label).to.equal('I agree to terms');
        expect(config.fieldsConfig['agreeToTerms'].id).to.equal('agreeToTerms');
        expect(config.fieldsConfig['agreeToTerms'].hideLabel).to.equal(false);
    });

    it('Validates formConfig fields async correctly', async () => {
        createValidationApi()
        let forObject = {userName: '', password: '', age: 17, email: 'abe@example.com', city: ''};
        let config = createFormConfig(forObject, {
            hideLabels: true,
            fieldsConfig: {
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
            fieldsConfig: {
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

    it('Respects user config choices', () => {
        let registration = {userName: '', password: 'a', confirmPassword: 'b'};
        let formConfig = createFormConfig(registration, {
            readonly: true, id: 'ab',
            fieldsConfig: {
                userName: {label: 'User ID', placeholder: 'Your unique name', readonly: false}
            }
        });
        let formConfig2 = createFormConfig(registration, formConfig);

        expect(JSON.stringify(formConfig)).to.equal(JSON.stringify(formConfig2));
    })

});