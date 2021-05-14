import { describe } from 'mocha';
const chai = require('chai');
const expect = chai.expect;

import {isEmpty, getFriendlyFileSize, humanize} from '../src/Utilities'

describe('Utilities tests', () => {

    it('Humanizes texts properly', () => {
        expect(humanize('Gone')).to.equal('Gone');
        expect(humanize('gone')).to.equal('Gone');
        expect(humanize('goneWithIt')).to.equal('Gone With It');
        expect(humanize('gone_with_it')).to.equal('Gone with it');
    });

    it('Friendly file sizes', () => {
        expect(getFriendlyFileSize(1024)).to.equal('1 Kb');
        expect(getFriendlyFileSize(1024**2)).to.equal('1 Mb');
    });

    it('Check if a string is whitespace or null', () => {
        expect(isEmpty('')).to.equal(true);
        expect(isEmpty(' \n')).to.equal(true);
        expect(isEmpty(null)).to.equal(true);
        expect(isEmpty('a')).to.equal(false);
    });

});