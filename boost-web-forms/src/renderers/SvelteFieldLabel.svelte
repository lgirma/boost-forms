<script lang="ts">
    import type {FieldConfigBase} from "../FormService";

    export let field: FieldConfigBase
</script>

{#if !field.hideLabel}
    <label for={field.id} style="{field.type === 'checkbox' || field.readonly ? 'display: inline-block;' : ''}">
        {field.label}{#if field.required}<span style="color:red">*</span>{/if}
        {#if field.readonly}: {/if}
    </label>
{/if}