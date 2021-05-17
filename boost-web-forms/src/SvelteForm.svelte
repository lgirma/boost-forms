<script lang="ts">
    import type {FieldConfigBase, WebForm} from "./FormService";
    import type {FormValidationResult} from "./Models";
    import {createFormConfig, validateForm} from "./FormService";
    import {renderField, renderLabel} from "./VanillaFormRenderer";

    export let forObject
    export let options: WebForm|null = null
    export let validationResult: FormValidationResult|null = {errorMessage: '', fields: {}, hasError: false}

    $: config = options || createFormConfig(forObject)
    $: fields = Object.keys(config.fieldsConfig).map(k => config?.fieldsConfig[k]) as FieldConfigBase[]

    async function onSubmit(e) {
        validationResult = await validateForm(forObject, config)
        if (validationResult.hasError)
            e.preventDefault()
    }
</script>

<form on:submit={onSubmit}>
    {#each fields as field}
        <div>
            {@html renderLabel(field).outerHTML}
            {@html renderField(forObject[field.id], field).outerHTML}
            {#if validationResult.fields[field.id]?.hasError}
                <div style="color: red">
                    {validationResult.fields[field.id].errorMessage}
                </div>
            {/if}
        </div>
    {/each}
    <div>
        <input type="submit" value="Submit" />
    </div>
</form>