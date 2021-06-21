import { describe } from 'mocha';
// @ts-ignore
const chai = require('chai');
const expect = chai.expect;
// @ts-ignore
import {createServer, Server} from "http";
import axios from 'axios'

import {AbstractLabel, AbstractLabelProps} from '../src/components/AbstractLabel'
import {createFieldConfig} from '../src/FormService'
import {AbstractDomElement, AbstractDomNode} from "vdtree";

describe('Abstract label tests', () => {

    it('Renders labels properly', () => {
        let input = AbstractLabel(
            { field: createFieldConfig('age', 5) }) as AbstractDomElement

        expect(input.tag).to.equal('label');
        expect(input.props.for).to.equal('age');
        expect(input.children).to.deep.equal(['Age']);
    })

    it('Renders hidden labels properly', () => {
        let input = AbstractLabel(
            { field: createFieldConfig('age', 5, {hideLabel: true}) }) as AbstractDomNode
        expect(input).to.equal('');
    })

});