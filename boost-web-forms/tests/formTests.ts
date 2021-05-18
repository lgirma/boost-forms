import { describe } from 'mocha';
// @ts-ignore
const chai = require('chai');
const expect = chai.expect;

import {guessType, createFormConfig, validateForm} from '../src/FormService'

describe('Form service tests', () => {

    it('Guesses types correctly', () => {
        expect(guessType('password', null)).to.equal('password');
        expect(guessType('a', 1)).to.equal('number');
        expect(guessType('b', 'a')).to.equal('text');
        expect(guessType('b', null)).to.equal('text');
        expect(guessType('b', true)).to.equal('checkbox');
        expect(guessType('email', '')).to.equal('email');
    });

    it('Sets up form config properly', () => {
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
        expect(config.fieldsConfig['userName'].hideLabel).to.equal(false);
        expect(config.fieldsConfig['password'].label).to.equal('Password');
        expect(config.fieldsConfig['password'].id).to.equal('password');
        expect(config.fieldsConfig['rememberMe'].label).to.equal('Remember Me');
        expect(config.fieldsConfig['rememberMe'].id).to.equal('rememberMe');
        expect(config.fieldsConfig['agreeToTerms'].label).to.equal('I agree to terms');
        expect(config.fieldsConfig['agreeToTerms'].id).to.equal('agreeToTerms');
        expect(config.fieldsConfig['agreeToTerms'].hideLabel).to.equal(true);
    });

    it('Validates forms correctly', async () => {
        let forObject = {userName: '', age: 17, email: 'abe@example.com', city: ''};
        let config = createFormConfig(forObject, {
            hideLabels: true,
            fieldsConfig: {
                userName: {required: true},
                email: {required: true},
                age: {validate: async val => (val > 18 ? '' : 'AGE_18_OR_ABOVE')}
            }
        });
        let validationResult = await validateForm(forObject, config);

        expect(validationResult.hasError).to.be.true;
        expect(validationResult.fields.city.hasError).to.be.false;
        expect(validationResult.fields.age.hasError).to.be.true;
        expect(validationResult.fields.age.errorMessage).to.equal('AGE_18_OR_ABOVE');
        expect(validationResult.fields.email.hasError).to.be.false;
    });

    it('Does form level validation', async () => {
        let registration = {userName: '', password: 'a', confirmPassword: 'b'};
        let formConfig = createFormConfig(registration, {
            validate: form => (form.password != form.confirmPassword ? 'PASSWORDS_DONT_MATCH' : '')
        });
        let validationResult = await validateForm(registration, formConfig);
        expect(validationResult.hasError).to.be.true;
        expect(validationResult.errorMessage).to.equal('PASSWORDS_DONT_MATCH');
    });

});