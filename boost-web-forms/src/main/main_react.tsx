import {createFormConfig} from "../FormService";
import {GetReactForm} from "../renderers/ReactFormRenderer";
import React from 'react'
import ReactDOM from 'react-dom'
import {forObj, options} from "./main_common";

const Form = GetReactForm(React.createElement)

ReactDOM.render(
    <Form forObject={forObj} options={options} />,
    document.getElementById('app')
);