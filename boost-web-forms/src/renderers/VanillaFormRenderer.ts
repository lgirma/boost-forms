import {
    createFormConfig,
    getFieldConfigs,
    validateForm,
} from "../FormService";
import {FormValidationResult, WebFormEvents, WebFormFieldEvents, FieldConfigBase, WebForm} from "../Models";
import {AbstractDomElement, vdom, DomElementChildrenFrom, humanize, toHtmlDom} from 'boost-web-core'
import {FormLayout, LayoutRenderer, getHtmlAttrs, RenderFormOptions, SimpleTextTypes, getHtmlFormAttrs} from "./Common";

export const DefaultLayout: FormLayout = {
    renderForm(forObject, form: WebForm, renderer: LayoutRenderer): DomElementChildrenFrom {
        const result = vdom('div', {})
        for (const [fieldId, field] of Object.entries(form.fieldsConfig)) {
            const label = renderer.label(field)
            let input = renderer.input(forObject[fieldId], field)
            if (field.type === 'radio') {
                input = Object.keys(field.choices as {})
                    .map((k, i) => vdom('label', {}, [
                        input[i],
                        ' ',
                        field.choices[k]
                    ]))
            }
            const fieldSet = vdom('div', {}, field.type == 'checkbox' && !field.readonly
                ? [...(input.constructor === Array ? input : [input]), ' ', label]
                : [label, ' ', ...(input.constructor === Array ? input : [input])])
            result.children.push(fieldSet)
        }
        return result;
    }
}

export function renderForm(forObject, options?: WebForm, validationResult?: FormValidationResult, renderOptions?: RenderFormOptions): HTMLElement {
    let rootElt = getAbstractForm(forObject, options, validationResult, renderOptions)
    return toHtmlDom(document.createElement, document, rootElt)
}

const VanillaJSRenderer: LayoutRenderer = {
    label: (field, attrs) => renderLabel(field, attrs),
    input: (val, field, attrs) => renderInput(val, field, attrs),
    form: (formConfig: WebForm, attrs?: any, rootTag = 'form') =>
        vdom(rootTag, {...getHtmlFormAttrs(formConfig), ...attrs})
}

export function getAbstractForm(forObject, options?: WebForm, validationResult?: FormValidationResult, renderOptions?: RenderFormOptions) {
    validationResult ??= {message: '', hasError: false, fields: {}}
    renderOptions = renderOptions || {} as any
    options = options || createFormConfig(forObject)
    const {
        labelAttrs = f => ({}), fieldSetAttrs = f => ({}),
        inputAttrs = f => ({}),
        layout = DefaultLayout
    } = renderOptions


    let rootElt = layout.renderForm(forObject, options, VanillaJSRenderer, validationResult)

   /* for (const [fieldId, field] of Object.entries(options.fieldsConfig)) {
        const fieldSet = layout.renderFieldSet(field, forObject[fieldId], VanillaJSRenderer, options, forObject)
        rootElt.children.push(fieldSet)
    }*/

    rootElt.attrs.onsubmit = async (e: Event) => {
        const validationResult = await validateForm(getFormState(options, rootElt), options)
        if (validationResult.hasError) {
            e.preventDefault()
            alert(`Validation error: \n${validationResult.message} \n ${Object.keys(validationResult.fields).filter(k => validationResult.fields[k].hasError)
                .map(k => `${humanize(k)}: ${validationResult.fields[k].message}`).join('\n')}`)
        }
        if (renderOptions.onValidation)
            renderOptions.onValidation(e, validationResult)

        /*if (options.onsubmit)
            options.onsubmit(e)*/
    }

    return rootElt
}

export function renderInput(val, field: FieldConfigBase, attrs = {}): string|AbstractDomElement|(AbstractDomElement|string)[] {
    if (field.readonly) {
        if (field.type == 'checkbox')
            return val ? 'Yes' : 'No'
        else if (field.type == 'html') {
            return vdom('div', {}, val)
        }
        else if (field.type == 'markdown') {
            return vdom('div', {}, val)
        }
        else if (field.type == 'select' || field.type == 'radio') {
            return vdom('div', {}, field.choices[val])
        }
        return `${val == null ? '' : val}`
    }

    const eltAttrs = {
        ...getHtmlAttrs(field),
        ...attrs
    }

    if (field.type == 'textarea') {
        return vdom('textarea', {rows: 3, ...eltAttrs}, val||'')
    }
    if (field.type == 'submit') {
        return vdom('input', {type: 'submit', value: field.label ?? 'Submit', ...eltAttrs})
    }
    if (field.type == 'checkbox') {
        return vdom('input', {type: 'checkbox', checked: !!val, ...eltAttrs})
    }
    if (field.type == 'toggle') {
        return vdom('input', {type: 'checkbox', checked: val != null, value: field.choices[0], ...eltAttrs})
    }
    if (field.type == 'select') {
        return vdom('select', {...eltAttrs}, [
            ...(field.required ? null : [vdom('option', {value: ''}, field.placeholder ?? '')]),
            ...Object.keys(field.choices as {})
                .map(k => vdom('option', {value: k, selected: k == `${val}` ? true : undefined}, field.choices[k]))
        ])
    }
    if (field.type == 'radio') {
        return Object.keys(field.choices as {})
            .map(k => vdom('input', {
                    ...eltAttrs,
                    id: undefined,
                    type: (field.multiple ? 'checkbox' : 'radio'),
                    value: `${k}`,
                    checked: (field.multiple ? (val as any[]).indexOf(k) > -1 : k == val) ? true : undefined}))

    }
    if (field.type == 'files')
        return vdom('input', {...eltAttrs, type: 'file', multiple: 'multiple', value: `${val == null ? '' : val}`})
    if (field.type == 'number')
        return vdom('input', {...eltAttrs, type: 'number', value: `${val == null ? '' : val}`})
    if (field.type == 'range')
        return vdom('input', {...eltAttrs, type: 'range', value: `${val == null ? '' : val}`})
    if (field.type == 'money')
        return vdom('input', {min: '0', step: '0.01', ...eltAttrs, type: 'number', value: `${val == null ? '' : val}`})
    if (SimpleTextTypes.indexOf(field.type) > -1)
        return vdom('input', {...eltAttrs, type: field.type, value: `${val == null ? '' : val}`})
    console.warn(`Unsupported field type: '${field.type}' for field '${field.id}'.`)
    return ''
}

export function renderLabel(field: FieldConfigBase, attrs = {}) {
    if (field.hideLabel)
        return ''
    const label = vdom('label', {...attrs, for: field.id})
    if (field.type == 'checkbox' || field.readonly)
        label.attrs.style = { display: 'inline-block' }
    label.children.push(field.label)
    label.children.push(field.required ? vdom('span', {style: {color: 'red'}}, '*') : '')
    label.children.push(field.readonly ? ': ' : '')
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
    else if (field.type == 'number')
        val = parseFloat(elt.value)
    else
        val = elt.value
    return val
}