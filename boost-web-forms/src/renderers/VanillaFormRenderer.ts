import {
    createFormConfig,
    getFieldConfigs,
    validateForm,
} from "../FormService";
import {FormValidationResult, WebFormEvents, WebFormFieldEvents, FieldConfig, WebForm} from "../Models";
import {
    AbstractDomElement,
    vdom,
    DomElementChildrenFrom,
    humanize,
    toHtmlDom,
    DomElementChildren,
    AbstractDomNode, Dict, OneOrMany, toArray, isArray, DeepPartial
} from 'boost-web-core'
import {FormLayout, LayoutRenderer, getHtmlAttrs, RenderFormOptions, SimpleTextTypes, getHtmlFormAttrs} from "./Common";

export const DefaultLayout: FormLayout = {
    formLayout(forObject: any, form: WebForm, renderer: LayoutRenderer, validationResult?: FormValidationResult): AbstractDomElement {
        const result = vdom('div', {})
        for (const [fieldId, field] of Object.entries(form.fieldsConfig)) {
            const label = renderer.label(field)
            const fieldValidationResult = validationResult?.fields[fieldId] ?? {hasError: false}
            let input = renderer.input(forObject[fieldId], field)
            if (fieldValidationResult.hasError && !field.readonly) {
                toArray(input).forEach(i => {
                    if (typeof(i) == 'string') return;
                    i.attrs.style ??= {};
                    i.attrs.style.border = '1px solid red'
                })

                toArray(label).forEach(l => {
                    if (typeof(l) == 'string') return;
                    if (field.type != 'radio' && field.type != 'checkbox') return;
                    l.attrs.style ??= {};
                    l.attrs.style.color = 'red'
                })
            }
            if (field.type === 'radio') {
                input = Object.keys(field.choices as {})
                    .map((k, i) => vdom('label', {}, [
                        input[i],
                        ' ',
                        (field.choices as Dict<string>)[k]
                    ]))
            }

            const fieldSet = vdom('div', {})
            if (field.type != 'checkbox' || field.readonly)
                fieldSet.children.push(...toArray(label), ' ', ...toArray(input))
            else
                fieldSet.children.push(...toArray(input), ' ', ...toArray(label))

            if (fieldValidationResult.hasError)
                fieldSet.children.push(vdom('div', {style: {color: 'red'}},
                    vdom('small', {}, fieldValidationResult.message)))
            result.children.push(fieldSet)
        }
        return result;
    }
}

export function renderForm(forObject: any, options?: WebForm, validationResult?: FormValidationResult, renderOptions?: RenderFormOptions): HTMLElement {
    let rootElt = getAbstractForm(forObject, options, renderOptions, validationResult)
    return toHtmlDom(document.createElement, document, rootElt)
}

const VanillaJSRenderer: LayoutRenderer = {
    label: (field, attrs) => renderLabel(field, attrs),
    input: (val, field, attrs) => renderInput(val, field, attrs),
    form: (formConfig: WebForm, attrs?: any, rootTag = 'form') =>
        vdom(rootTag, {...getHtmlFormAttrs(formConfig), ...attrs})
}

export function getAbstractForm(forObject: any, options?: DeepPartial<WebForm>, renderOptions?: RenderFormOptions, validationResult?: FormValidationResult) {
    validationResult ??= {message: '', hasError: false, fields: {}}
    let _renderOptions = renderOptions ?? {}
    let _options = createFormConfig(forObject, options)
    const {
        labelAttrs = f => ({}), fieldSetAttrs = f => ({}),
        inputAttrs = f => ({}), layout = DefaultLayout
    } = _renderOptions

    return layout.formLayout(forObject, _options, VanillaJSRenderer, validationResult)
}

export function renderInput(val: any, field: FieldConfig, attrs = {}): OneOrMany<AbstractDomNode> {
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
            ...(field.required ? [] : [vdom('option', {value: ''}, field.placeholder ?? '')]),
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

export function renderLabel(field: FieldConfig, attrs = {}): AbstractDomNode {
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
    for (const [fieldId, field] of Object.entries(form.fieldsConfig)) {
        result[fieldId] = readFieldValue(field, formElt)
    }
    return result
}

export function readFieldValue(field: FieldConfig, formElt: HTMLElement) {
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