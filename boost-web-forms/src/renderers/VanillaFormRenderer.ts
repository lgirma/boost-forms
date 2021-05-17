import {createFormConfig, FieldConfigBase, FormConfigBase, validateForm, WebForm} from "../FormService";
import {FormValidationResult, WebFormEvents, WebFormFieldEvents} from "../Models";
import {createDomTree, humanize} from 'boost-web-core'

export interface VanillaFormOptions extends WebFormEvents, WebFormFieldEvents {
    labelAttrs?: (fieldConfig: FieldConfigBase) => {}
    inputAttrs?: (fieldConfig: FieldConfigBase) => {}
    fieldSetAttrs?: (fieldConfig: FieldConfigBase) => {}
    formAttrs?: {}

    excludeFormTag?: boolean
    excludeSubmitButton?: boolean
}

export function getHtmlAttrs(field: FieldConfigBase) {
    const src = {
        id: field.id,
        name: field.id,
        placeholder: field.placeholder,
        step: field.step,
        pattern: field.pattern,
        min: field.min,
        max: field.max,
        maxlength: field.maxlength,
        disabled: field.disabled,
        hidden: field.hidden,
        required: field.required
    }
    let result : any = {
        name: field.id
    }
    for (const k in src) {
        let val = field[k]
        if (val != null && val != '') {
            if (k == 'disabled') {
                if (val) result.disabled = true
            }
            else if (k == 'hidden') {
                if (val) result.hidden = true
            }
            else if (k == 'required') {
                if (val) result.required = true
            }
            else
                result[k] = val
        }
    }
    return result
}

export function renderForm(forObject, formConfig?: WebForm, validationResult?: FormValidationResult, options: VanillaFormOptions = {}): HTMLElement {
    validationResult ??= {errorMessage: '', hasError: false, fields: {}}
    options = options || {}
    formConfig = formConfig || createFormConfig(forObject)
    const {labelAttrs = f => ({}), fieldSetAttrs = f => ({}), inputAttrs = f => ({}), formAttrs = {}} = options
    let rootElt = createDomTree<HTMLFormElement>(options.excludeFormTag ? 'div' : 'form', {...formAttrs})

    let fields = Object.keys(formConfig.fieldsConfig).map(k => formConfig.fieldsConfig[k])
    for (const field of fields) {
        const label = renderLabel(field, labelAttrs(field))
        const input = renderField(forObject[field.id], field, inputAttrs(field))
        let fieldSet = createDomTree('div', {...fieldSetAttrs(field)}, field.type == 'checkbox' && !field.readonly
            ? [input, label]
            : [label, input])
        rootElt.append(fieldSet)
    }

    if (!options.excludeSubmitButton && !formConfig.readonly)
        rootElt.append(createDomTree('div', {},
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

export function renderField(val, field: FieldConfigBase, attrs = {}): string|HTMLElement {
    if (field.readonly) {
        if (field.type == 'checkbox')
            return val ? 'Yes' : 'No'
        else if (field.type == 'html') {
            const result = document.createElement('div')
            result.innerHTML = val
            return result
        }
        else if (field.type == 'markdown') {
            const result = createDomTree<HTMLDivElement>('div')
            result.innerHTML = val
            return result
        }
        else if (field.type == 'select' || field.type == 'radio') {
            const result = createDomTree<HTMLDivElement>('div')
            result.innerHTML = field.choices[val]
            return result
        }
        return `${val == null ? '' : val}`
    }

    const eltAttrs = {
        ...getHtmlAttrs(field),
        ...attrs
    }

    if (field.type == 'textarea') {
        return createDomTree('textarea', {rows: 3, ...eltAttrs}, val||'')
    }
    if (field.type == 'checkbox') {
        return createDomTree('input', {type: 'checkbox', checked: !!val, ...eltAttrs})
    }
    if (field.type == 'toggle') {
        return createDomTree('input', {type: 'checkbox', checked: val != null, value: field.choices[0], ...eltAttrs})
    }
    if (field.type == 'select') {
        return createDomTree('select', {...eltAttrs}, [
            ...(field.required ? null : [createDomTree<HTMLOptionElement>('option', {value: ''}, field.placeholder ?? '')]),
            ...Object.keys(field.choices as {})
                .map(k => createDomTree<HTMLOptionElement>('option', {value: k, selected: k == `${val}` ? true : undefined}, field.choices[k]))
        ])
    }
    if (field.type == 'radio') {
        return createDomTree('div', {}, Object.keys(field.choices as {})
            .map(k => createDomTree('label', {},
                [
                    createDomTree('input', {
                        ...eltAttrs,
                        id: undefined,
                        type: (field.multiple ? 'checkbox' : 'radio'),
                        value: `${k}`,
                        checked: (field.multiple ? (val as any[]).indexOf(k) > -1 : k == val) ? true : undefined}),
                    field.choices[k]
                ])))

    }
    if (field.type == 'files')
        return createDomTree('input', {...eltAttrs, type: 'file', multiple: 'multiple', value: `${val == null ? '' : val}`})
    return createDomTree('input', {...eltAttrs, type: field.type, value: `${val == null ? '' : val}`})
}

export function renderLabel(field: FieldConfigBase, attrs = {}): string|HTMLLabelElement {
    if (!field.showLabel )
        return ''
    const label = createDomTree<HTMLLabelElement>('label', {...attrs, for: field.id})
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
        result[fieldId] = readFieldValue(field, formElt)
    }
    return result
}

export function readFieldValue(field: FieldConfigBase, formElt: HTMLElement) {
    let val: any = ''
    const elt = formElt.querySelector('#' + field.id) as any
    if (field.type == 'radio') {
        let radios = [...document.getElementsByName(field.id)] as HTMLInputElement[]
        val = field.multiple
            ? radios.find(r => r.checked)?.value ?? ''
            : radios.filter(r => r.checked).map(r => r.value) ?? []
    }
    else if (field.type == 'checkbox')
        val = elt.checked
    else if (field.type == 'file')
        val = elt.files
    else
        val = elt.value
    return val
}