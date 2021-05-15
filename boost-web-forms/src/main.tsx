import {createFormConfig} from "./FormService";
import {GetReactFormComponent} from "./ReactFormRenderer";
import React from 'react'
import ReactDOM from 'react-dom'

const forObject = {
    email: '',
    password: '',
    rememberMe: true
}

const formConfig = createFormConfig(forObject)
const Form = GetReactFormComponent(React.createElement)

ReactDOM.render(
    <Form forObject={forObject} formConfig={formConfig} />,
    document.getElementById('app')
);