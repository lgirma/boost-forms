<script lang="ts">
    import {getHtmlAttrs, SimpleTextTypes} from "./Common";

    export let value
    export let field
    export let attrs = {}
    export let renderer: (() => string|HTMLElement) = null

    function onSimpleInputChange(e, field) {
        value = e.target.value
    }

    let customHtml = renderer == null ? null : renderer()
</script>

{#if renderer != null}
    {#if typeof(customHtml) === 'string'}
        {@html customHtml}
    {:else}
        {@html customHtml.outerHTML}
    {/if}
{:else if field.type === 'textarea'}
    <textarea bind:value={value} rows="3" {...getHtmlAttrs(field)} {...attrs}></textarea>
{:else if field.type === 'checkbox'}
    <input type="checkbox" bind:checked={value} {...getHtmlAttrs(field)} {...attrs} />
    <!--{:else if field.type === 'toggle'}
        <input type="checkbox" bind:checked={value != null} value={field.choices[0]} {...getHtmlAttrs(field)} />-->
{:else if field.type === 'select'}
    <select bind:value={value} {...getHtmlAttrs(field)} {...attrs}>
        {#if !field.required}
            <option value="">{field.placeholder}</option>
        {/if}
        {#each Object.entries(field.choices) as [choiceKey, choiceVal]}
            <option value={choiceKey}>{choiceVal}</option>
        {/each}
    </select>
{:else if field.type === 'radio'}
    <div>
        {#each Object.entries(field.choices) as [choiceKey, choiceVal]}
            <label>
                {#if field.multiple}
                    <input type="checkbox" {...getHtmlAttrs(field)} {...attrs} id={undefined} bind:group={value} value={choiceKey} />
                {:else}
                    <input type="radio" {...getHtmlAttrs(field)} {...attrs} id={undefined} bind:group={value} value={choiceKey} />
                {/if}
                {choiceVal}
            </label>
        {/each}
    </div>
{:else if field.type === 'files'}
    <input type="file" {...getHtmlAttrs(field)} {...attrs} multiple bind:files={value} />
{:else if field.type === 'file'}
    <input type="file" {...getHtmlAttrs(field)} {...attrs} bind:files={value} />
{:else if field.type === 'file'}
    <input type="file" {...getHtmlAttrs(field)} {...attrs} bind:files={value} />
{:else if field.type === 'number'}
    <input type="number" step="0.1" {...getHtmlAttrs(field)} {...attrs} bind:value={value} />
{:else if field.type === 'money'}
    <input type="number" step="0.01" min="0" {...getHtmlAttrs(field)} {...attrs} bind:value={value} />
{:else if field.type == null || field.type.length === 0 || SimpleTextTypes.indexOf(field.type) > -1}
    <input type={field.type} on:input={e => onSimpleInputChange(e, field)} {...getHtmlAttrs(field)} {...attrs} value={value} />
{:else}
    {console.warn(`Unsupported field type: '${field.type}' for field '${field.id}'.`) || ''}
{/if}