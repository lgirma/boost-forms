import {createFormConfig, validateForm} from "../FormService";
import {GetReactForm} from "../renderers/ReactFormRenderer";
import React, {ReactElement, useEffect, useState} from 'react'
import ReactDOM from 'react-dom'
import {forObj, options, renderOptions} from "./main_common";
import {getFormValue, onFieldChangeReducer} from "../renderers/VanillaFormRenderer";
import {FormValidationResult, getFormValidationResult} from "../Models";

const Form = GetReactForm(React)

function MyForm() {
    const [formData, setFormData] = useState(forObj)
    const config = createFormConfig(forObj, options)

    function onSubmit(e) {
        alert('Submitting ' + JSON.stringify(formData))
        e.preventDefault()
    }

    useEffect(() => console.log('Change', formData), [formData])

    return <Form forObject={formData}
                onSubmit={onSubmit}
                onChange={e => {setFormData(onFieldChangeReducer(config, e))}}
                {...config}
    />
}



ReactDOM.render(
    <MyForm />,
    document.getElementById('app')
);