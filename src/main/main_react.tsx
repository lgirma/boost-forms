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
    const [validation, setValidation] = useState(getFormValidationResult)

    const config = createFormConfig(forObj, options)

    function onSubmit(e) {
        alert('Submitted')
    }

    useEffect(() => console.log('Change', formData), [formData])

    return <Form forObject={formData}
                validationResult={validation}
                onSubmit={onSubmit}
                onChange={e => {setFormData(onFieldChangeReducer(config, e))}}
                {...config}
    />
}



ReactDOM.render(
    <MyForm />,
    document.getElementById('app')
);