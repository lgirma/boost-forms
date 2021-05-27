<script lang="ts">
    import type {FieldConfig} from "../Models";

    export let field: FieldConfig
    export let attrs = {}
</script>

{#if !field.hideLabel}
    {#if field.type === 'radio'}
        <div style="{field.readonly ? 'display: inline-block;' : ''}" {...attrs}>
            {field.label}{#if field.required}<span style="color:red">*</span>{/if}
            {#if field.readonly}: {/if}
        </div>
    {:else}
        <label for={field.id} style="{field.type === 'checkbox' || field.readonly ? 'display: inline-block;' : ''}" {...attrs}>
            {field.label}{#if field.required}<span style="color:red">*</span>{/if}
            {#if field.readonly}: {/if}
        </label>
    {/if}
{/if}