import {
    createFormConfig,
    getFieldConfigs,
    validateForm,
} from "../FormService";
import {FormValidationResult, WebFormEvents, WebFormFieldEvents, FieldConfigBase, WebForm} from "../Models";
import {AbstractDomElement, createAbstractDom, DomElementChildrenFrom, humanize, toHtmlDom} from 'boost-web-core'
import {FormLayout, LayoutRenderer, getHtmlAttrs, RenderFormOptions, SimpleTextTypes} from "./Common";

export const DefaultLayout: FormLayout = {
    renderForm(forObject, form: WebForm, renderer: LayoutRenderer): DomElementChildrenFrom {
        const result = createAbstractDom('div', {})
        for (const [fieldId, field] of Object.entries(form.fieldsConfig)) {
            const label = renderer.label(field)
            let input = renderer.input(forObject[fieldId], field)
            if (field.type === 'radio') {
                input = Object.keys(field.choices as {})
                    .map((k, i) => createAbstractDom('label', {}, [
                        input[i],
                        ' ',
                        field.choices[k]
                    ]))
            }
            const fieldSet = createAbstractDom('div', {}, field.type == 'checkbox' && !field.readonly
                ? [...(input.constructor === Array ? input : [input]), ' ', label]
                : [label, ' ', ...(input.constructor === Array ? input : [input])] as any)
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
    //fields: (forObj, formConfig) =>
}

export function getAbstractForm(forObject, options?: WebForm, validationResult?: FormValidationResult, renderOptions?: RenderFormOptions) {
    validationResult ??= {errorMessage: '', hasError: false, fields: {}}
    renderOptions = renderOptions || {} as any
    options = options || createFormConfig(forObject)
    const {
        labelAttrs = f => ({}), fieldSetAttrs = f => ({}),
        inputAttrs = f => ({}), submitAttrs = (a,b) => ({}),
        layout = DefaultLayout
    } = renderOptions



    let rootElt = createAbstractDom(renderOptions.excludeFormTag ? 'div' : 'form', {...getHtmlAttrs(options)})
    rootElt.children.push(layout.renderForm(forObject, options, VanillaJSRenderer))

   /* for (const [fieldId, field] of Object.entries(options.fieldsConfig)) {
        const fieldSet = layout.renderFieldSet(field, forObject[fieldId], VanillaJSRenderer, options, forObject)
        rootElt.children.push(fieldSet)
    }*/

    if (!renderOptions.excludeSubmitButton && !options.readonly)
        rootElt.children.push(createAbstractDom('div', {},
            createAbstractDom('input', {type: 'submit', value: 'Submit', ...submitAttrs(forObject, options)})))

    rootElt.attrs.onsubmit = async (e: Event) => {
        const validationResult = await validateForm(getFormState(options, rootElt), options)
        if (validationResult.hasError) {
            e.preventDefault()
            alert(`Validation error: \n${validationResult.errorMessage} \n ${Object.keys(validationResult.fields).filter(k => validationResult.fields[k].hasError)
                .map(k => `${humanize(k)}: ${validationResult.fields[k].errorMessage}`).join('\n')}`)
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
            return createAbstractDom('div', {}, val)
        }
        else if (field.type == 'markdown') {
            return createAbstractDom('div', {}, val)
        }
        else if (field.type == 'select' || field.type == 'radio') {
            return createAbstractDom('div', {}, field.choices[val])
        }
        return `${val == null ? '' : val}`
    }

    const eltAttrs = {
        ...getHtmlAttrs(field),
        ...attrs
    }

    if (field.type == 'textarea') {
        return createAbstractDom('textarea', {rows: 3, ...eltAttrs}, val||'')
    }
    if (field.type == 'checkbox') {
        return createAbstractDom('input', {type: 'checkbox', checked: !!val, ...eltAttrs})
    }
    if (field.type == 'toggle') {
        return createAbstractDom('input', {type: 'checkbox', checked: val != null, value: field.choices[0], ...eltAttrs})
    }
    if (field.type == 'select') {
        return createAbstractDom('select', {...eltAttrs}, [
            ...(field.required ? null : [createAbstractDom('option', {value: ''}, field.placeholder ?? '')]),
            ...Object.keys(field.choices as {})
                .map(k => createAbstractDom('option', {value: k, selected: k == `${val}` ? true : undefined}, field.choices[k]))
        ])
    }
    if (field.type == 'radio') {
        return Object.keys(field.choices as {})
            .map(k => createAbstractDom('input', {
                    ...eltAttrs,
                    id: undefined,
                    type: (field.multiple ? 'checkbox' : 'radio'),
                    value: `${k}`,
                    checked: (field.multiple ? (val as any[]).indexOf(k) > -1 : k == val) ? true : undefined}))

    }
    if (field.type == 'files')
        return createAbstractDom('input', {...eltAttrs, type: 'file', multiple: 'multiple', value: `${val == null ? '' : val}`})
    if (field.type == 'number')
        return createAbstractDom('input', {...eltAttrs, type: 'number', value: `${val == null ? '' : val}`})
    if (field.type == 'range')
        return createAbstractDom('input', {...eltAttrs, type: 'range', value: `${val == null ? '' : val}`})
    if (field.type == 'money')
        return createAbstractDom('input', {min: '0', step: '0.01', ...eltAttrs, type: 'number', value: `${val == null ? '' : val}`})
    if (SimpleTextTypes.indexOf(field.type) > -1)
        return createAbstractDom('input', {...eltAttrs, type: field.type, value: `${val == null ? '' : val}`})
    console.warn(`Unsupported field type: '${field.type}' for field '${field.id}'.`)
    return ''
}

export function renderLabel(field: FieldConfigBase, attrs = {}) {
    if (field.hideLabel)
        return ''
    const label = createAbstractDom('label', {...attrs, for: field.id})
    if (field.type == 'checkbox' || field.readonly)
        label.attrs.style = 'display: inline-block'
    label.children.push(field.label)
    label.children.push(field.required ? createAbstractDom('span', {style: 'color: red'}, '*') : '')
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