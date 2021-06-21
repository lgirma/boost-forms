import { describe } from 'mocha';
// @ts-ignore
const chai = require('chai');
const expect = chai.expect;
// @ts-ignore
import {createServer, Server} from "http";
import axios from 'axios'

import {AbstractInput, AbstractInputProps} from '../src/components/AbstractInput'
import {createFieldConfig} from '../src/FormService'
import {AbstractDomElement, AbstractDomNode} from "vdtree";

describe('Abstract input tests', () => {

    it('Renders read-only fields properly', () => {
        const props = {
            field: createFieldConfig('age', 5, {readonly: true}),
            value: 5
        }
        let input = AbstractInput(props) as AbstractDomNode

        expect(input).to.equal('5');
    })

    it('Renders input attributes properly', () => {
        const props = {
            field: createFieldConfig('age', 5, {placeholder: 'Aging', required: true}),
            value: 5
        }
        let input = AbstractInput(props) as AbstractDomElement

        expect(input.tag).to.equal('input');
        expect(input.props.placeholder).to.equal('Aging');
        expect(input.props.id).to.equal('age');
        expect(input.props.name).to.equal('age');
        expect(input.props.required).to.equal(true);
        expect(input.props.value).to.equal('5');
    })

    it('Renders select fields properly', () => {
        const props = {
            field: createFieldConfig('gender', '1', {type: 'select', choices: {0: 'M', 1: 'F'}}),
            value: '1'
        }
        let input = AbstractInput(props) as AbstractDomElement

        expect(input.tag).to.equal('select');
        expect(input.props.id).to.equal('gender');
        expect(input.props.name).to.equal('gender');
        expect((input.children[1] as AbstractDomElement).children).to.deep.equal(['M'])
        expect(!!(input.children[1] as AbstractDomElement).props.selected).to.equal(false)
        expect((input.children[2] as AbstractDomElement).children).to.deep.equal(['F'])
        expect(!!(input.children[2] as AbstractDomElement).props.selected).to.equal(true)
    })

    it('Renders radio fields properly', () => {
        const props = {
            field: createFieldConfig('gender', '1', {type: 'radio', choices: {0: 'M', 1: 'F'}}),
            value: '1'
        }
        let input = AbstractInput(props) as AbstractDomElement[]

        expect(input.length).to.equal(2)
        expect(input[0].tag).to.equal('input');
        expect(input[0].props.type).to.equal('radio');
        expect(input[0].props.name).to.equal('gender');
        expect(input[0].props.value).to.equal('0');
        expect(!!input[0].props.checked).to.equal(false);
        expect(input[1].props.value).to.equal('1');
        expect(!!input[1].props.checked).to.equal(true);
    })

    it('Renders html input types appropriately', () => {
        let inputNum = AbstractInput(
            {field: createFieldConfig('age', 5, {type: 'number'}), value: 5}) as AbstractDomElement
        let inputTxt = AbstractInput(
            {field: createFieldConfig('fName', '', {type: 'text'}), value: ''}) as AbstractDomElement
        let inputEmail = AbstractInput(
            {field: createFieldConfig('email', '', {type: 'email'}), value: ''}) as AbstractDomElement

        expect((inputNum ).tag).to.equal('input');
        expect((inputNum).props.type).to.equal('number');
        expect((inputTxt).tag).to.equal('input');
        expect((inputTxt).props.type).to.equal('text');
        expect((inputEmail).tag).to.equal('input');
        expect((inputEmail).props.type).to.equal('email');
    })

});