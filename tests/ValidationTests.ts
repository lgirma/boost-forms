import { describe } from 'mocha';
import {notEmpty, validName, getMinLenValidator, getStrongPasswordValidator} from "../src";
// @ts-ignore
const chai = require('chai');
const expect = chai.expect;

describe('notEmpty tests', () => {

    it('Returns OK on non-empty values', () => {
        expect(notEmpty('a')).to.equal('');
        expect(notEmpty([1,2])).to.equal('');
    });

    it('Returns error message on empty values', () => {
        expect(notEmpty('')).to.not.equal('');
        expect(notEmpty(null)).to.not.equal('');
        expect(notEmpty(undefined)).to.not.equal('');
        expect(notEmpty([])).to.not.equal('');
    });

});

describe('validName tests', () => {

    it('Returns error on inhuman values', () => {
        expect(validName('-')).to.not.equal('');
        expect(validName('_*_')).to.not.equal('');
        expect(validName('(John)')).to.not.equal('');
    });

});

describe('min length validator tests', () => {

    it('Returns error on less than min length values', () => {
        expect(getMinLenValidator(3)('-')).to.not.equal('');
        expect(getMinLenValidator(3)('12')).to.not.equal('');
        expect(getMinLenValidator(3)(null)).to.not.equal('');
    });

    it('Returns OK on equal or greater than min length values', () => {
        expect(getMinLenValidator(3)('123')).to.equal('');
        expect(getMinLenValidator(3)('12474')).to.equal('');
    });

});

describe('strong password validator tests', () => {

    it('Returns error on empty passwords', () => {
        expect(getStrongPasswordValidator()('')).to.not.equal('');
    });

    it('Returns error on few char passwords', () => {
        expect(getStrongPasswordValidator({minLength: 8})('ab')).to.not.equal('');
    });

    it('Returns error on weak passwords', () => {
        const validator = getStrongPasswordValidator({minLength: 4, specialChars: true})
        expect(validator('JohnWick')).to.not.equal('');
        expect(validator('John123')).to.not.equal('');
    });

    it('Returns OK on strong passwords', () => {
        const validator = getStrongPasswordValidator({minLength: 4, specialChars: true})
        expect(validator('John_Wick1')).to.equal('');
    });

    it('Returns OK on weak passwords with specialChars option off', () => {
        const validator = getStrongPasswordValidator({minLength: 4, specialChars: false})
        expect(validator('JohnWick')).to.equal('');
    });

});