import {FieldConfigBase, FormConfigBase, validateForm, WebForm} from "./FormService";
import {WebFormEvents, WebFormFieldEvents} from "./Models";
import {createDomTree, humanize} from 'boost-web-core'

export interface VanillaFormOptions extends WebFormEvents, WebFormFieldEvents {
    labelAttrs?: (fieldConfig: FieldConfigBase) => {}
    inputAttrs?: (fieldConfig: FieldConfigBase) => {}
    fieldSetAttrs?: (fieldConfig: FieldConfigBase) => {}
    formAttrs?: {}

    excludeFormTag?: boolean
    excludeSubmitButton?: boolean
}

function getAttrs(attrs: {} = {}) {
    attrs = attrs || {}
    return `${Object.keys(attrs).map(a => `${a}="${attrs[a]}"`).join(' ')}`
}

export function renderForm(forObject, formConfig: WebForm, options: VanillaFormOptions = {}): HTMLElement {
    options = options || {}
    const {labelAttrs = f => ({}), fieldSetAttrs = f => ({}), inputAttrs = f => ({}), formAttrs = {}} = options
    let rootElt = createDomTree(options.excludeFormTag ? 'div' : 'form', {...formAttrs})

    let fields = Object.keys(formConfig.fieldsConfig).map(k => formConfig.fieldsConfig[k])
    for (const field of fields) {
        const label = renderLabel(field, labelAttrs(field))
        const input = renderField(forObject[field.id], field, inputAttrs(field))
        let fieldSet = createDomTree('div', {...fieldSetAttrs(field)}, input.type == 'checkbox' && !field.readonly
            ? [input, label]
            : [label, input])
        rootElt.append(fieldSet)
    }

    if (!options.excludeSubmitButton && !formConfig.readonly)
        rootElt.appendChild(createDomTree('div', {},
            createDomTree('input', {type: 'submit', value: 'Submit'})))

    rootElt.addEventListener('submit',  async e => {
        const validationResult = await validateForm(getFormState(formConfig, rootElt), formConfig)
        if (validationResult.hasError) {
            e.preventDefault()
            alert(`Validation error: \n${validationResult.errorMessage} \n ${Object.keys(validationResult.fields).filter(k => validationResult.fields[k].hasError)
                    .map(k => `${humanize(k)}: ${validationResult.fields[k].errorMessage}`).join('\n')}`)
        }
        if (options.onValidation)
            options.onValidation(e, validationResult)
    });

    if (options.onSubmit)
        rootElt.addEventListener('submit', options.onSubmit)

    return rootElt
}

export function renderField(val, field: FieldConfigBase, attrs = {}) {
    if (field.readonly) {
        if (field.type == 'checkbox')
            return val ? 'Yes' : 'No'
        else if (field.type == 'html') {
            const result = document.createElement('div')
            result.innerHTML = val
            return result
        }
        else if (field.type == 'markdown') {
            const result = createDomTree('div')
            result.innerHTML = val
            return result
        }
        return `${val == null ? '' : val}`
    }

    const eltAttrs = {
        id: field.id,
        name: field.id,
        placeholder: field.placeholder,
        step: field.step,
        pattern: field.pattern,
        min: field.min,
        max: field.max,
        maxlength: field.maxlength,
        disabled: field.disabled,
        ...attrs
    }

    if (field.type == 'textarea') {
        return createDomTree('textarea', {rows: 3, ...eltAttrs}, val||'')
    }
    if (field.type == 'checkbox') {
        return createDomTree('input', {type: 'checkbox', checked: !!val, ...eltAttrs})
    }
    if (field.type == 'select') {
        return createDomTree('select', {...eltAttrs}, [
            ...(field.required ? null : [createDomTree('option', {value: ''}, field.placeholder ?? '')]),
            ...Object.keys(field.selectOptions.options as {})
                .map(k => createDomTree('option', {value: k, selected: k == `${val}` ? true : undefined}, field.selectOptions.options[k]))
        ])
    }
    if (field.type == 'radio') {
        return createDomTree('div', {}, Object.keys(field.selectOptions.options as {})
            .map(k => createDomTree('label', {},
                [
                    createDomTree('input', {...eltAttrs, id: undefined, type: 'radio', value: `${k}`, checked: k == val ? true : undefined}),
                    field.selectOptions.options[k]
                ])))

    }
    if (field.type == 'files')
        return createDomTree('input', {...eltAttrs, type: 'file', multiple: 'multiple', value: `${val == null ? '' : val}`})
    return createDomTree('input', {...eltAttrs, type: field.type, value: `${val == null ? '' : val}`})
}

export function renderLabel(field: FieldConfigBase, attrs = {}) {
    if (!field.showLabel )
        return ''
    const label = createDomTree('label', {...attrs, for: field.id})
    if (field.type == 'checkbox' || field.readonly)
        label.style.display = 'inline-block'
    label.append(field.label)
    label.innerHTML += (field.required ? '<span style="color:red">*</span>' : '') + (field.readonly ? ': ' : '')
    return label
}

export function getFormState(form: WebForm, formElt: HTMLElement) {
    let result = {}
    for (const fieldId in form.fieldsConfig) {
        const field = form.fieldsConfig[fieldId]
        let val: any = ''
        const elt = formElt.querySelector('#' + fieldId) as any
        if (field.type == 'radio') {
            let radios = [...document.getElementsByName(fieldId)] as HTMLInputElement[]
            val = radios.find((r) => r.checked)?.value ?? ''
        }
        else if (field.type == 'checkbox')
            val = elt.checked
        else if (field.type == 'file')
            val = elt.files
        else
            val = elt.value;
        result[fieldId] = val
    }
    return result
}