<script lang="ts">
    export let value
    export let field
</script>

{#if field.type === 'checkbox'}
    {value ? 'Yes' : 'No'}
{:else if field.type === 'html'}
    {@html value}
{:else if field.type === 'markdown'}
    {@html value}
{:else if field.type === 'select' || field.type === 'radio'}
    {#if field.multiple}
        <ul>
            {#each Object.entries(field.choices) as [k, v]}
                {#if (value).indexOf(k) > -1}
                    <li>{v}</li>
                {/if}
            {:else}
                -
            {/each}
        </ul>
    {:else}
        {field.choices[value] ?? ''}
    {/if}
{:else}
    {value == null ? '' : value}
{/if}