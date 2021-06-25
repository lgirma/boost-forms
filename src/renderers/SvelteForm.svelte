<script lang="ts">
    import type {FormValidationResult, FormConfig} from "../Models";
    import {getFormValidationResult} from '../Models'
    import {createFormConfig} from "../FormService";
    import type {DeepPartial} from "boost-web-core";
    import { createEventDispatcher, onMount } from 'svelte';
    import {onFieldChangeReducer} from "./VanillaFormRenderer";
    import {SvelteWrapper} from "vdtree";
    import {AbstractForm} from "../components/AbstractForm";

    const dispatch = createEventDispatcher();

    export let forObject
    export let options: DeepPartial<FormConfig> | null = null
    export let validationResult = getFormValidationResult()
    let _safeOptions: FormConfig

    function initConfig(opts) {
        let safeOptions = opts != null && opts.$$isComplete
            ? opts
            : createFormConfig(forObject, opts)
        safeOptions.onsubmit = (e: Event) => {
            dispatch('submit', e)
        }
        safeOptions.onchange = (e: Event) => {
            forObject = onFieldChangeReducer(safeOptions, e)(forObject)
            dispatch('change', e)
        }
        safeOptions.oninput = (e: Event) => {
            dispatch('input', e)
        }
        safeOptions.onblur = (e: Event) => {
            dispatch('blur', e)
        }
        _safeOptions = safeOptions
    }

</script>

<SvelteWrapper dom={AbstractForm({forObject, formConfig: _safeOptions, validationResult, htmlAttrs: {}})} />

