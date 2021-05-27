import {createFormConfig} from "../FormService";
import {GetReactForm} from "../renderers/ReactFormRenderer";
import React, {ReactElement} from 'react'
import ReactDOM from 'react-dom'
import {forObj, options, renderOptions} from "./main_common";

const Form = GetReactForm(React.createElement)

ReactDOM.render(
    <Form forObject={forObj} renderOptions={renderOptions} onsubmit={e => alert('Submitting...')}
        fieldsConfig={{
            gender: {
                type: 'radio', readonly: false,
                choices: {0: 'Male', 1: 'Female'}
            }
        }}/>,
    document.getElementById('app')
);