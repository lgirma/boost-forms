<script>
    import SvelteForm from './renderers/SvelteForm.svelte'
    import {createFormConfig} from "./FormService";
    let forObj = {
        userName: '',
        password: '',
        age: 5,
        rememberMe: true
    }

    let options = createFormConfig(forObj, {
        fieldsConfig: {
            age: {
                validate: v => v < 18 ? 'Age must be at least 18' : ''
            }
        }
    })
</script>

<SvelteForm forObject={forObj} {options} />
