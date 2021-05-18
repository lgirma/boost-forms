<script>
    import SvelteForm from './renderers/SvelteForm.svelte'
    import {createFormConfig} from "./FormService";
    import {fileTypeValidator, MIME_PDF, notEmpty, validName} from "./Validation";
    let forObj= {
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        gender: '0',
        accountType: '',
        dateOfBirth: "2001-02-01",
        receiveNewsletter: false,
        packages: ['newsLetter', 'premiumSupport'],
        comment: '',
        requestDiscount: 5.5,
        passportDocument: null
    };
    const options = createFormConfig(forObj, {
        readonly: false,
        fieldsConfig: {
            name: {validate: [notEmpty, validName]},
            email: {required: true, placeholder: 'mail@company.com'},
            accountType: {
                type: 'select',
                placeholder: '-- Select Account Type --',
                choices: ['Commercial', 'Personal']
            },
            gender: {
                type: 'radio', readonly: false,
                choices: {0: 'Male', 1: 'Female'}
            },
            comment: {type: 'textarea'},
            passportDocument: {
                type: 'files', validate: [fileTypeValidator(MIME_PDF)],
                required: true
            }
        },
        validate: val => (val.password !== val.confirmPassword ? 'Passwords do not match.' : '')
    })
</script>

<SvelteForm forObject={forObj} {options} on:submit={e => alert('submitting')} on:error={e => alert('invalid input')} />
