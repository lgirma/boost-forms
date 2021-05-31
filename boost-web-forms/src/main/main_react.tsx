import {createFormConfig, validateForm} from "../FormService";
import {GetReactForm} from "../renderers/ReactFormRenderer";
import React, {ReactElement, useEffect, useState} from 'react'
import ReactDOM from 'react-dom'
import {forObj, options, renderOptions} from "./main_common";
import {getFormValue, onFieldChangeReducer} from "../renderers/VanillaFormRenderer";
import {FormValidationResult, VALID_FORM} from "../Models";

const Form = GetReactForm(React.createElement)

function MyForm() {
    const [formData, setFormData] = useState(forObj)
    const [validation, setValidation] = useState(VALID_FORM)

    const config = createFormConfig(forObj, options)

    function onSubmit(e) {
        const formValue = getFormValue(config, e.target)
        const vr = validateForm(formValue, config)
        if (vr.hasError)
            e.preventDefault();
        setValidation(vr)
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