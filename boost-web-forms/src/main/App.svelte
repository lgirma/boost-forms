<script>
    import SvelteForm from '../renderers/SvelteForm.svelte'
    import {Bootstrap5} from "../renderers/Plugins";

import {forObj, options} from "./main_common";

</script>

<SvelteForm forObject={forObj} {options} renderOptions={Bootstrap5}
            on:submit={e => alert('submitting')} on:error={e => alert('invalid input')} />
