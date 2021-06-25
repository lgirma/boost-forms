<script>
    import SvelteForm from '../renderers/SvelteForm.svelte'
    import {forObj, options} from "./main_common";
    import {createFormConfig, validateForm} from "../FormService";
    import {getFormValidationResult} from "../Models";
    import {h, SvelteWrapper} from 'vdtree'


    let formData = {...forObj}
    let formConfig = createFormConfig(forObj, options)
    let validationResult = getFormValidationResult()

    function onSubmit(e) {
        alert('Submitting ' + JSON.stringify(formData))
        e.preventDefault()
    }

    $: console.log('Change', formData)

</script>

<SvelteForm bind:forObject={formData} options={formConfig} {validationResult} on:submit={onSubmit} />