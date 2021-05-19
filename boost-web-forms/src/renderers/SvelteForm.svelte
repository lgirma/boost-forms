<script lang="ts">
    import type {FieldConfigBase, WebForm} from "../FormService";
    import type {FormValidationResult} from "../Models";
    import {createFormConfig, validateForm, findCustomRenderer} from "../FormService";
    import type {RenderFormOptions} from "./Common";
    import SvelteFieldLabel from "./SvelteFieldLabel.svelte";
    import SvelteReadOnlyValue from "./SvelteReadOnlyValue.svelte";
    import SvelteFormField from "./SvelteFormField.svelte";
    import { createEventDispatcher } from 'svelte';
    import {getHtmlFormAttrs} from "./Common";

    const dispatch = createEventDispatcher();

    export let forObject
    export let options: WebForm | null = null
    export let renderOptions: RenderFormOptions = {}
    export let validationResult: FormValidationResult | null = {errorMessage: '', fields: {}, hasError: false}
    let _safeOptions = options ?? createFormConfig(forObject)
    let _safeRenderOptions = {
        inputAttrs: f => {},
        fieldSetAttrs: f => {},
        labelAttrs: f => {},
        submitAttrs: (val, opts) => {},
        ...renderOptions,
    }

    function initConfig(opts) {
        _safeOptions = opts ?? createFormConfig(forObject)
    }

    $: initConfig(options)

    async function onSubmit(e) {
        validationResult = await validateForm(forObject, _safeOptions)
        dispatch('validate', {...e, validationResult})
        if (validationResult.hasError) {
            e.preventDefault()
            dispatch('error', {...e, validationResult})
        }
        else {
            dispatch('submit', {...e, forObject});
            options.onsubmit(e)
        }
    }

    // $: console.log('Config', config)
    // $: console.log('Change', forObject)
</script>

<form on:submit={onSubmit} {...getHtmlFormAttrs(_safeOptions)}>
    {#each Object.entries(_safeOptions.fieldsConfig) as [fieldId, field]}
        <div {..._safeRenderOptions.fieldSetAttrs(field)}>
            {#if field.type !== 'checkbox' || field.readonly}
                <SvelteFieldLabel {field} attrs={_safeRenderOptions.labelAttrs(field)} />
            {/if}
            {#if options.readonly}
                <SvelteReadOnlyValue value={forObject[fieldId]} {field} />
            {:else}
                <SvelteFormField bind:value={forObject[fieldId]} {field} attrs={_safeRenderOptions.inputAttrs(field)}
                    renderer={findCustomRenderer(field.type) == null ? null : () => findCustomRenderer(field.type).renderField(forObject, _safeOptions, field)} />
            {/if}
            {#if field.type === 'checkbox' && !field.readonly}
                <SvelteFieldLabel {field} attrs={_safeRenderOptions.labelAttrs(field)} />
            {/if}
        </div>
    {/each}
    {#if !renderOptions.excludeSubmitButton}
        <div>
            <input type="submit" value="Submit" {..._safeRenderOptions.submitAttrs(forObject, _safeOptions)} />
        </div>
    {/if}
</form>