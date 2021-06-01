<script lang="ts">
    import type {FormValidationResult, FormConfig} from "../Models";
    import {getFormValidationResult} from '../Models'
    import {createFormConfig} from "../FormService";
    import type {RenderFormOptions} from "./Common";
    import { createEventDispatcher, onMount } from 'svelte';
    import {onFieldChangeReducer, renderForm} from "./VanillaFormRenderer";
    // @ts-ignore
    import {DiffDOM} from "diff-dom";

    const dispatch = createEventDispatcher();
    const dd = new DiffDOM({valueDiffing: false});

    export let forObject
    export let options: FormConfig | null = null
    export let renderOptions: RenderFormOptions = {}
    export let validationResult = getFormValidationResult()
    let _safeOptions: FormConfig

    function initConfig(opts) {
        let safeOptions = opts ?? createFormConfig(forObject)
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

    let container;
    let mounted = false;

    onMount(() => {
        mounted = true;
    })

    $: {
        if (mounted) {
            initConfig(options)
            const newChild = renderForm(forObject, _safeOptions as any, validationResult, renderOptions)
            if (container.children.length == 0)
                container.appendChild(newChild)
            else {
                let diff = dd.diff(container.firstChild, newChild);
                let success = dd.apply(container.firstChild, diff);
                if (!success) {
                    console.warn('Diff couldn\'t be applied');
                    container.innerHTML = ''
                    container.appendChild(newChild)
                }
            }

            /*container.innerHTML = ''
            container.appendChild(child);*/
        }
    }
</script>

<div bind:this={container}></div>

