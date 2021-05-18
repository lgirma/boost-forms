import {createFormConfig} from "../FormService";
import {GetReactForm} from "../renderers/ReactFormRenderer";
import React from 'react'
import ReactDOM from 'react-dom'
import '../../style.css'

const obj = {
    email: '',
    password: '',
    rememberMe: true
}

const Form = GetReactForm(React.createElement)

ReactDOM.render(
    <Form forObject={obj} />,
    document.getElementById('app')
);