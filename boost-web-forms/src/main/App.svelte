<script>
    import SvelteForm from '../renderers/SvelteForm.svelte'

import {forObj, options, renderOptions} from "./main_common";

</script>

<SvelteForm forObject={forObj} {options} renderOptions={renderOptions}
            on:submit={e => alert('submitting')} on:error={e => alert('invalid input')} />
