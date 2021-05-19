<script lang="ts">
    import type {FieldConfigBase} from "../FormService";

    export let field: FieldConfigBase
    export let attrs = {}
</script>

{#if !field.hideLabel}
    <label for={field.id} style="{field.type === 'checkbox' || field.readonly ? 'display: inline-block;' : ''}" {...attrs}>
        {field.label}{#if field.required}<span style="color:red">*</span>{/if}
        {#if field.readonly}: {/if}
    </label>
{/if}