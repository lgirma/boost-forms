import {
    FormValidationResult,
    FieldConfig,
    FormConfig, getFormValidationResult
} from "../Models";
import {Nullable, isEmpty, DeepPartial} from 'boost-web-core'
import {toDomElement, h, renderToDom} from "vdtree";
import {AbstractForm} from "../components/AbstractForm";
import {createFormConfig, validateForm} from "../FormService";

export function renderForm(forObject: any, target: HTMLElement, formConfig?: DeepPartial<FormConfig>, validationResult?: FormValidationResult) {
    validationResult = validationResult ?? getFormValidationResult()
    let _formConfig = formConfig != null && formConfig?.$$isComplete
        ? formConfig as FormConfig
        : createFormConfig(forObject, formConfig)
    let FormComponent = h(AbstractForm,{forObject, formConfig: _formConfig, validationResult})
    if (_formConfig.autoValidate && !_formConfig.excludeFormTag) {
        let onSubmit = _formConfig.onsubmit
        _formConfig.onsubmit = undefined
        let rendered = renderToDom(FormComponent, target)
        rendered.$$domElement.addEventListener('submit', e => {
            let state = getFormValue(_formConfig, e.target as HTMLElement)
            let vr = validateForm(state, _formConfig)
            if (vr.hasError) {
                e.preventDefault()
                rendered.newProps(a =>({...a, forObject: state, validationResult: vr}))
            }
            else {
                rendered.newProps(a =>({...a, forObject: state, validationResult: vr}))
                if (onSubmit) (onSubmit as any)(e)
            }
        })
    }
    else {
        let domElt = toDomElement<HTMLElement>(FormComponent as any, target)
        target.append(domElt)
    }
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

export function getFormValue(form: FormConfig, formElement?: HTMLElement) {
    let result = {}
    for (const [fieldId, field] of Object.entries(form.fieldsConfig)) {
        result[fieldId] = getFieldValue(fieldId, field)
    }
    return result
}