export const x = 5
/*
import {createFormConfig} from "../FormService";
import {GetReactForm} from "../renderers/ReactFormRenderer";
import React, {useEffect, useState} from 'react'
import ReactDOM from 'react-dom'
import {forObj, options} from "./main_common";
import {getFormValue, onFieldChangeReducer} from "../renderers/VanillaFormRenderer";

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
);*/
