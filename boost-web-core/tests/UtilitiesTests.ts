import { describe } from 'mocha';
const chai = require('chai');
const expect = chai.expect;

import {isEmpty, getFriendlyFileSize, humanize} from '../src/Utilities'

describe('Humanize tests', () => {

    it('Humanizes texts properly', () => {
        expect(humanize('Gone')).to.equal('Gone');
        expect(humanize('gone')).to.equal('Gone');
        expect(humanize('goneWithIt')).to.equal('Gone With It');
        expect(humanize('gone_with_it')).to.equal('Gone With It');
    });

});