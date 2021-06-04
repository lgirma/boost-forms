<script>
    import SvelteForm from '../renderers/SvelteForm.svelte'
    import {forObj, options, renderOptions} from "./main_common";
    import {createFormConfig, validateForm} from "../FormService";
    import {getFormValidationResult} from "../Models";


    let formData = {...forObj}
    let formConfig = createFormConfig(forObj, options)
    let validationResult = getFormValidationResult()

    function onSubmit(e) {
        validationResult = validateForm(formData, formConfig)
        if (validationResult.hasError)
            e.detail.preventDefault()
    }

    $: console.log('Change', formData)

</script>

<SvelteForm bind:forObject={formData} options={formConfig}
            renderOptions={renderOptions}
            {validationResult}
            on:submit={onSubmit} />
