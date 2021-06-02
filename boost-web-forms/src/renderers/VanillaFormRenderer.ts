import {createFormConfig} from "../FormService";
import {FormValidationResult, WebFormEvents, WebFormFieldEvents, FieldConfig, FormConfig} from "../Models";
import {
    AbstractDomElement,
    vdom,
    toHtmlDom,
    AbstractDomNode, Dict, OneOrMany, toArray, DeepPartial, Nullable, isEmpty, groupBy
} from 'boost-web-core'
import {FormLayout, LayoutRenderer, getHtmlAttrs, RenderFormOptions, SimpleTextTypes, getHtmlFormAttrs} from "./Common";
import {MarkdownInput, Rating, SourceCodeInput} from "./components";

export const DefaultLayout: FormLayout = {
    formLayout(forObject: any, form: FormConfig, renderer: LayoutRenderer, validationResult?: FormValidationResult): AbstractDomElement {
        const result = renderer.form(form, {})
        result.children.push(vdom('style', {}, 'label {display: table; margin-top: 10px; cursor: pointer}'))
        /*if (validationResult?.hasError)
            result.children.push(vdom('div', {style: {color: 'red'}}, validationResult.message))*/
        let fieldGroups = groupBy(Object.entries(form.fieldsConfig).map(e => e[1]), f => f.group)
        const showGroups = Object.keys(fieldGroups).length > 1
        for (const [group, fields] of Object.entries(fieldGroups)) {
            if (showGroups) {
                result.children.push(...[
                    vdom('h3', {}, group || 'Misc'),
                    vdom('hr')
                ])
            }
            for (const field of fields) {
                const label = renderer.label(field)
                const fieldValidationResult = validationResult?.fields[field.id] ?? {hasError: false}
                let input = renderer.input(forObject[field.id], field)
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
        }
        return result;
    }
}

export function renderForm(forObject: any, options?: DeepPartial<FormConfig>, validationResult?: FormValidationResult, renderOptions?: RenderFormOptions): HTMLElement {
    let rootElt = getAbstractForm(forObject, options, renderOptions, validationResult)
    return toHtmlDom(document.createElement, document, rootElt)
}

export function updateForm(patcher: (to: Node, from: Node) => boolean, container: Element, newForm: Node) {
    if (container.children.length == 0)
        container.appendChild(newForm)
    else {
        let success = patcher(container.firstChild!, newForm)
        if (!success) {
            console.warn('Diff couldn\'t be applied');
            container.innerHTML = ''
            container.appendChild(newForm)
        }
    }
}

const VanillaJSRenderer: LayoutRenderer = {
    label: (field, attrs) => renderLabel(field, attrs),
    input: (val, field, attrs) => renderInput(val, field, attrs),
    form: (formConfig: FormConfig, attrs?: any, rootTag = 'form') =>
        vdom(rootTag, {...getHtmlFormAttrs(formConfig), ...attrs})
}

export function getAbstractForm(forObject: any, options?: DeepPartial<FormConfig>, renderOptions?: RenderFormOptions, validationResult?: FormValidationResult) {
    validationResult ??= {message: '', hasError: false, fields: {}}
    let _options = createFormConfig(forObject, options)
    const {
        labelAttrs = f => ({}), fieldSetAttrs = f => ({}),
        inputAttrs = f => ({}), layout = DefaultLayout
    } = renderOptions ?? {}

    return layout.formLayout(forObject, _options, VanillaJSRenderer, validationResult)
}

export function renderInput(val: any, field: FieldConfig, attrs = {}): OneOrMany<AbstractDomNode> {
    if (field.readonly) {
        if (field.type == 'checkbox')
            return val ? 'Yes' : 'No'
        else if (field.type == 'sourcecode') {
            return vdom('pre', {}, val)
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
        return vdom('input', {...eltAttrs, type: 'file', multiple: 'multiple', files: val})
    if (field.type == 'file')
        return vdom('input', {...eltAttrs, type: 'file', files: val})
    if (field.type == 'number')
        return vdom('input', {...eltAttrs, type: 'number', value: `${val == null ? '' : val}`})
    if (field.type == 'name')
        return vdom('input', {...eltAttrs, type: 'text', value: `${val == null ? '' : val}`})
    if (field.type == 'range')
        return vdom('input', {...eltAttrs, type: 'range', value: `${val == null ? '' : val}`})
    if (field.type == 'money')
        return vdom('input', {min: '0', step: '0.01', ...eltAttrs, type: 'number', value: `${val == null ? '' : val}`})
    if (field.type == 'rating')
        return Rating(val, eltAttrs)
    if (field.type == 'markdown')
        return MarkdownInput(val, eltAttrs, {renderer: src => src})
    if (field.type == 'sourcecode')
        return SourceCodeInput(val, eltAttrs, {renderer: src => src})
    if (field.type == 'composite') {
        return vdom('div', {style: {margin: '5px', border: '1px solid gray', padding: '2px'}},
            getAbstractForm(val, {excludeSubmitButton: true, ...field.customOptions}, {excludeFormTag: true}))
    }
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

export function onFieldChangeReducer(form: FormConfig, event: Event): (previousFormData: any) => any {
    const input = (event.target as HTMLInputElement)
    if (isEmpty(input?.name))
        return v => v
    return prevVal => ({
        ...prevVal,
        [input.name]: getChangedFieldValue(form, event.target)
    })
}

export function getFieldIdFromElement(elt: Node) {
    return (elt as HTMLInputElement).name
}

export function getChangedFieldValue(form: FormConfig, target: Nullable<EventTarget>) {
    if (target == null) return null
    const fieldId = getFieldIdFromElement(target as Node)
    const field = form.fieldsConfig[fieldId]
    return getFieldValue(fieldId, field, [target])
}

export function getFieldValue(fieldId: string, field: FieldConfig, fieldElements?: any[]) {
    if (field == null)
        return null;
    let val: any = ''
    fieldElements ??= [...document.getElementsByName(fieldId)]
    if (fieldElements.length == 0)
        return null
    let fieldElement = fieldElements[0] as Node
    let input = fieldElement as HTMLInputElement
    if (field.type == 'radio') {
        let radios = fieldElements as HTMLInputElement[]
        val = field.multiple
            ? radios.filter(r => r.checked).map(r => r.value)
            : input.checked ? input.value : ''
    }
    else if (field.type == 'checkbox')
        val = input.checked
    else if (field.type == 'file' || field.type == 'files')
        val = input.files
    else if (field.type == 'number')
        val = parseFloat(input.value)
    else
        val = input.value
    return val
}

export function getFormValue(form: FormConfig, formElement: HTMLElement) {
    let result = {}
    for (const [fieldId, field] of Object.entries(form.fieldsConfig)) {
        result[fieldId] = getFieldValue(fieldId, field)
    }
    return result
}