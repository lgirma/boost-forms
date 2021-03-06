import {
    humanize,
    randomHash,
    isDate,
    isDateTime,
    isYear,
    isTime,
    DeepPartial,
    isEmpty,
    toArray, Dict, OneOrMany, Nullable
} from 'boost-web-core';
import {
    FormValidationResult,
    ValidationResult,
    ValidateFunc,
    getValidationResult,
    AsyncValidateFunc,
    CustomFieldRenderer,
    FormFieldType,
    FieldConfig, FormConfig, getFormValidationResult, FormValidateFunc
} from "./Models";
import {notEmpty} from './Validation';
import {FormPlugin, globalPlugins} from "./Plugins";
import {DefaultFormLayout, FormLayoutProps} from "./components";
import {DefaultFieldSet, FieldSetLayoutProps} from "./components/DefaultFieldSet";

export function registerPlugin(p: OneOrMany<FormPlugin>) {
    let plugins = toArray(p)
    for (const pl of plugins)
        globalPlugins.register(pl)
}

let customFieldRenderers : CustomFieldRenderer[] = []

export function addCustomFieldRenderer(renderer: CustomFieldRenderer): string {
    const id = randomHash()
    customFieldRenderers.push({...renderer, id})
    return id
}

export function findCustomRenderer(forType: string): Nullable<CustomFieldRenderer> {
    return customFieldRenderers.find(cfr =>
        typeof(cfr.forType) === 'string'
            ? forType.toLowerCase() == cfr.forType.toLowerCase()
            : cfr.forType.indexOf(forType) > -1) ?? null
}

export function createFormConfig(forObject: any, _config: DeepPartial<FormConfig> = {}): FormConfig {
    _config ??= {}
    let config: FormConfig = {
        scale: 1,
        readonly: false,
        hideLabels: false,
        excludeSubmitButton: false,
        autoValidate: true,
        noValidate: true,
        ..._config,
        fieldsConfig: {
            ...Object.keys(forObject).reduce((a, fieldId) => ({...a, [fieldId]: null}), {}),
            ..._config.fieldsConfig
        },
        $$isComplete: true
    }

    if (!config.excludeSubmitButton) {
        config.fieldsConfig['$$submit'] = {
            ...getDefaultFieldConfig('$$submit', 'submit', config),
            hideLabel: true,
            label: 'Submit',
            type: 'submit'
        }
    }

    for (const fieldId in forObject) {
        if (!forObject.hasOwnProperty(fieldId))
            continue
        config.fieldsConfig[fieldId] = createFieldConfig(fieldId, forObject[fieldId], config.fieldsConfig[fieldId], config)
    }

    globalPlugins.runForAll(p => p?.hooks?.onCreateFormConfig?.(config))

    return config;
}

export function createFieldConfig(fieldId: string, fieldValue: any,
                                  fieldConfig?: DeepPartial<FieldConfig>, formConfig?: DeepPartial<FormConfig>): FieldConfig {
    let type = fieldConfig?.type ?? guessType(fieldId, fieldValue)

    let result = {
        ...getDefaultFieldConfig(fieldId, type, formConfig),
        ...guessConfig(fieldValue, type, fieldConfig),
        ...fieldConfig,
    } as FieldConfig
    if (isEmpty(result.label))
        result.label = humanize(fieldId)
    result.choices = (result?.choices == null
        ? {}
        : (result.choices?.constructor === Array
            ? (result.choices as string[]).reduce((acc, b) => ({...acc, [b]: b}), {})
            : result.choices))

    globalPlugins.runForAll(p => p?.hooks?.onCreateFieldConfig?.(result, formConfig))
    return result
}

export function getDefaultFieldConfig(fieldId: string, type: FormFieldType, formConfig?: DeepPartial<FormConfig>): FieldConfig {
    return {
        scale: formConfig?.scale ?? 1,
        readonly: formConfig?.readonly ?? false,
        hideLabel: formConfig?.hideLabels ?? false,
        colSpan: 1,
        icon: '',
        helpText: '',
        validationResult: {
            message: '',
            hasError: false
        },
        id: fieldId,
        multiple: false,
        type: type,
        label: '',
        choices: []
    }
}

export function guessType(fieldId: string, fieldValue: any): FormFieldType {
    let guessFromPlugins = globalPlugins.queryFirst(p => p.hooks?.onTypeGuess?.(fieldId, fieldValue))
    if (guessFromPlugins != null)
        return guessFromPlugins

    let table : {[regex: string]: FormFieldType} = {
        'password$': 'password',
        'email$': 'email',
        'name$': 'name',
        'quantity$|number$': 'number',
        '^amount|amount$|^price|price$': 'money',
        '^date|date$': 'date', '^year|year$': 'year', '^month|month$': 'month',
        '^phone|phone$': 'tel',
        '^language|language$': 'language',
        '^rating|rating$': 'rating'
    }
    const fieldIdLower = fieldId.toLowerCase()

    for (const reg in table) {
        if (RegExp(reg).test(fieldIdLower))
            return table[reg]
    }
    if (fieldValue == null)
        return 'text';

    const jsType = typeof(fieldValue);

    if (jsType === 'boolean')
        return 'checkbox';
    if (jsType === 'string') {
        if (isDateTime(fieldValue))
            return 'datetime-local';
        if (isDate(fieldValue))
            return 'date';
        if (isTime(fieldValue))
            return 'time';
        if (isYear(fieldValue))
            return 'year';
        return 'text';
    }
    if (jsType === 'number')
        return 'number';
    if (fieldValue.constructor === Array)
        return 'radio';
    if (jsType === 'object' && fieldValue.constructor === Object)
        return 'composite'

    return 'text';
}

export function guessConfig(val: any, fieldType: FormFieldType, fieldConfig?: DeepPartial<FieldConfig>) : Partial<FieldConfig> {
    let result: Partial<FieldConfig> = {}
    if (val != null && val.constructor === Array && fieldType == 'radio') {
        result.choices = val.reduce((acc, el) => ({...acc, [el]: humanize(el)}), {})
        result.multiple = true
    }
    if (fieldType == 'password')
        result.required = true
    return result
}

export function addValidation(fieldConfig: FieldConfig, validation: ValidateFunc) {
    fieldConfig.validate = toArray(fieldConfig.validate)
    fieldConfig.validate.push(validation)
}

interface IntermediateFormValidationModel {
    isAsync: boolean
    form: FormValidationResult|Promise<FormValidationResult>
    fields: Dict<ValidationResult|Promise<ValidationResult>>
}

function mergeValidationResults(results: Nullable<ValidationResult>[]): ValidationResult {
    return (results as ValidationResult[]).reduce(
        (acc, curr) =>
            ({
                hasError: curr?.hasError || acc.hasError,
                message: !isEmpty(curr?.message) ? curr?.message : acc.message
            }),
        getValidationResult())
}

function mergeFieldsValidationResults(vrs: Dict<ValidationResult>[]): Dict<ValidationResult> {
    return vrs.reduce((acc, i) => {
        return Array.from(new Set([...Object.keys(acc), ...Object.keys(i)])).reduce((accDict, iKey) => {
            return {
                ...accDict,
                [iKey]: {
                    hasError: acc[iKey]?.hasError || i[iKey]?.hasError || false,
                    message: isEmpty(acc[iKey]?.message) ? (i[iKey]?.message ?? '') : acc[iKey]?.message
                }
            }
        }, {} as Dict<ValidationResult>)
    }, {})
}

function mergeFormValidationResults(vrs: FormValidationResult[]) : FormValidationResult {
    return vrs.reduce((acc, i) => {
        return {
            hasError: acc.hasError || i.hasError,
            message: isEmpty(i.message) ? acc.message : i.message,
            fields: mergeFieldsValidationResults([acc.fields, i.fields])
        }
    }, getFormValidationResult())
}

export function validateForm(forObject: any, _formConfig?: FormConfig) : FormValidationResult {
    const m = validateFormInternal(forObject, _formConfig)
    if (m.isAsync)
        console.error('Trying to synchronously validate formConfig with async validators')
    const formVR = m.form as FormValidationResult
    let result: FormValidationResult = {
        message: formVR.message,
        hasError: formVR.hasError,
        fields: mergeFieldsValidationResults([m.fields as Dict<ValidationResult>, (m.form as FormValidationResult).fields])
    }

    if (!result.hasError) {
        let anyOfFieldsHasError = Object.keys(result.fields).reduce((p, k) => p || result.fields[k].hasError, false)
        result.hasError ||= anyOfFieldsHasError
    }

    return result
}

export async function validateFormAsync(forObject: any, _formConfig?: FormConfig) : Promise<FormValidationResult> {
    const m = validateFormInternal(forObject, _formConfig)
    const formVR = await (m.form as Promise<FormValidationResult>)
    let result: FormValidationResult = {
        message: formVR.message,
        hasError: formVR.hasError,
        fields: formVR.fields
    }

    for (const [k, valPromise] of Object.entries(m.fields)) {
        const vr = await (valPromise as Promise<ValidationResult>)
        result.fields[k] = mergeValidationResults([vr, result.fields[k]])
        result.hasError ||= result.fields[k].hasError
    }

    Object.keys(forObject)
        .filter(k => result.fields[k] == null)
        .forEach(k => result.fields[k] = getValidationResult())

    return result
}

function validateFormInternal(forObject: any, _formConfig?: FormConfig) : IntermediateFormValidationModel {
    let formConfig = _formConfig ?? createFormConfig(forObject, _formConfig)
    let fieldsConfig = formConfig.fieldsConfig;
    let result: IntermediateFormValidationModel = {fields: {}, form: getFormValidationResult(), isAsync: false};
    for (const [id, value] of Object.entries(forObject)) {
        const config = fieldsConfig[id]
        result.fields[id] = getValidationResult()
        if (config == null) continue
        let validators = toArray(config.validate)
        if (config.required && validators.indexOf(notEmpty) == -1)
            validators.push(notEmpty);
        else if (validators.length == 0) continue
        let fieldVR = runValidator(validators, value);
        result.fields[id] = fieldVR
        if ((fieldVR as Promise<ValidationResult>).then !== undefined)
            result.isAsync = true
    }

    result.form = formConfig.validate
        ? runFormValidator(formConfig.validate, forObject)
        : getFormValidationResult();

    if ((result.form as Promise<FormValidationResult>).then !== undefined)
        result.isAsync = true
    return result
}

function getFormVRFromValidation(validationResult: null | string | Dict<string>): FormValidationResult|null {
    if (validationResult == null)
        return getFormValidationResult()
    if (typeof validationResult === 'string')
        return getFormValidationResult(validationResult)
    if (validationResult.then === undefined && typeof validationResult === 'object') {
        let fields: Dict<ValidationResult> = Object.keys(validationResult as Dict<string>)
            .reduce((acc, k) => ({...acc, [k]: getValidationResult(validationResult[k])}), {})
        return getFormValidationResult(null, fields)
    }

    return null
}

export function runFormValidator(validator: OneOrMany<FormValidateFunc>, form: any): FormValidationResult|Promise<FormValidationResult> {
    let validators = toArray(validator)
    if (validators.length == 0)
        return getFormValidationResult()
    try {
        let asyncVRs: Promise<FormValidationResult>[] = []
        let syncVRs: FormValidationResult = getFormValidationResult()
        for (let i = 0; i < validators.length; i++) {
            const v: FormValidateFunc = validators[i];
            if (v == null) continue
            let vResult = v(form)
            if (vResult == null)
                continue
            if (typeof(vResult) === 'string') {
                if (!isEmpty(vResult))
                    return getFormValidationResult(vResult)
                continue
            }
            if (vResult.then === undefined && typeof(vResult) === 'object') {
                syncVRs = getFormValidationResult(syncVRs.message, mergeFieldsValidationResults([
                    syncVRs.fields,
                    Object.keys(vResult as Dict<string>).reduce((acc, k) => ({...acc, [k]: getValidationResult(vResult[k])}), {})
                ]))
                continue
            }
            asyncVRs.push((vResult as Promise<any>)
                .then(res => getFormVRFromValidation(res) ?? getFormValidationResult())
                .catch(err => {
                    console.warn('Error while attempting to validate formConfig', err)
                    return getFormValidationResult('Failed to validate this entry.')
                }))
        }
        if (syncVRs.hasError)
            return syncVRs
        if (asyncVRs.length) {
            return Promise.all(asyncVRs).then(vrs => mergeFormValidationResults(vrs))
        }
        return syncVRs
    } catch (err) {
        return getFormValidationResult('Failed to validate the formConfig.');
    }
}

export function runValidator(validator: ValidateFunc | ValidateFunc[], value: any): ValidationResult|Promise<ValidationResult> {
    if (validator == null)
        return getValidationResult();
    try {
        const validators: ValidateFunc[] = toArray(validator)
        let asyncVRs: Promise<ValidationResult>[] = []
        for (let i = 0; i < validators.length; i++) {
            const v: ValidateFunc = validators[i];
            if (v == null) continue
            let vResult = v(value)
            if (vResult == null)
                continue
            if (typeof(vResult) === 'string') {
                if (!isEmpty(vResult))
                    return getValidationResult(vResult)
                continue
            }
            asyncVRs.push((vResult as Promise<string>)
                .then(errMsg => getValidationResult(errMsg))
                .catch(err => {
                    console.warn('Error while attempting to validate', err)
                    return getValidationResult('Failed to validate this entry.')
                }))
        }
        if (asyncVRs.length) {
            return Promise.all(asyncVRs).then(vrs => mergeValidationResults(vrs))
        }
    } catch (ex) {
        return getValidationResult('Failed to validate this entry.');
    }
    return getValidationResult()
}

export function getFieldConfigs(form: FormConfig): FieldConfig[] {
    return Object.keys(form.fieldsConfig).map(k => form.fieldsConfig[k])
}

export function getFieldHtmlAttrs(field: FieldConfig) {
    const src: Partial<FieldConfig> = {
        name: field.id,
        ...field,
        icon: undefined,
        type: undefined,
        helpText: undefined,
        label: undefined,
        validationResult: undefined,
        customOptions: undefined,
        maxlength: undefined,
        multiple: undefined,
        group: undefined,
        choices: undefined,
        variation: undefined,
        hideLabel: undefined,
        scale: undefined,
        readonly: undefined,
        validate: undefined,
        onValidation: undefined,
        colSpan: undefined
    }
    let result : any = {
        name: field.id
    }
    for (const [k, val] of Object.entries(src)) {
        if (val != null && val != '')
            result[k] = val
    }

    globalPlugins.runForAll(p => p.hooks?.onGetFieldHtmlAttrs?.(field, result))
    return result
}

export function getFormHtmlAttrs(form: FormConfig) {
    const src: Partial<FormConfig> = {
        ...form,
        fieldsConfig: undefined,
        validate: undefined,
        scale: undefined,
        hideLabels: undefined,
        excludeSubmitButton: undefined,
        readonly: undefined,
        validationResult: undefined,
        onValidation: undefined,
        excludeFormTag: undefined,
        $$isComplete: undefined,
        syncValues: undefined,
        autoValidate: undefined,
        plugins: undefined
    }
    let result : any = {}
    for (const [key, val] of Object.entries(src)) {
        if (val != null && val != '')
            result[key] = val
    }
    globalPlugins.runForAll(p => p.hooks?.onGetFormHtmlAttrs?.(form, result))
    return result
}

export function getFormLayout(layoutProps: FormLayoutProps) {
    return globalPlugins.pipeThroughAll((p, pV) => p.hooks?.onFormLayout?.(layoutProps, pV), DefaultFormLayout)
}

export function getFieldSetLayout(layoutProps: FieldSetLayoutProps) {
    return globalPlugins.pipeThroughAll((p, pV) => p.hooks?.onFieldSetLayout?.(layoutProps, pV), DefaultFieldSet)
}