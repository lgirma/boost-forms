# Boost-Web Forms

### What is it?
An opinionated tiny (~3 kb) form generator for javascript objects.

It basically turns this object:

```javascript
let obj = {
    userName: "",
    password: "",
    rememberMe: true
}
```

without any configuration or schema, into this:

![Login Form](resources/login_form.JPG)

### Why boost-web-forms?

* Zero dependencies
* Works with vanilla JS
* Built-in react and svelte support
* No schema needed to generate forms (although supported)

## Installation

```shell
npm i boost-web-forms
```

or 

```shell
yarn add boost-web-forms
```

## Getting Started

To generate a login form, 

1. Create your model:

```javascript
let forObj = {
    email: '',
    password: '',
    rememberMe: false
}
```

2. Render the form on the DOM:

**For vanilla javascript**:

```javascript
import {renderForm} from 'boost-web-forms'

const formHtmlElt = renderForm(forObj)
document.body.append(formHtmlElt)
```

**For Svelte**:
```jsx
import {SvelteForm as Form} from 'boost-web-forms'

<Form forObject={forObj} />
```

**For React**:
```jsx
import {GetReactForm} from 'boost-web-forms'

const Form = GetReactForm(React.createElement)
<Form forObject={forObj} />
```

This will render an HTML form with 3 fields,

* Email field with label
* Password field with type password
* A checkbox with the label: 'Remember Me'

## Configuring the Form

While the library includes good set of defaults, the form can be configured as needed.

For example, to make the form read-only and hide all labels, use:

```javascript
import {createFormConfig} from 'boost-web-forms'

const options = createFormConfig(forObj, {
    readonly: true,
    hideLabel: true
})
```

Then pass the configuration to any of the renderers:

```jsx
// Vanilla
document.body.append(
    renderForm(forObj, options)
)

// React
<Form forObject={forObj} options={options} />

// Svelte
<Form forObject={forObj} options={options} />
```

All available form configuration

| Option | Type | Default Value |
| --- | ----------- | ---------|
| `readonly` | boolean | false |
| `hideLabel` | boolean | false |

## Configuring Fields

Every individual field can be configured in the form configuration using `fieldsConfig` key.
For example, to make the password field readonly:

```javascript
const formConfig = createFormConfig(forObj, {
    fieldsConfig: {
        password: {readonly: true}
    }
})
```

Another example would be to set the type of fields. 
For example, to set types for 'confirm password' and comment fields as:

```javascript
const forObj = {
    name: '',
    password: '',
    confirmPassword: '',
    comment: ''
}

const formConfig = createFormConfig(forObj, {
    fieldsConfig: {
        confirmPassword: {type: 'password'},
        comment: {type: 'textarea', label: 'Any Comments?'}
    }
})
```

All available field configuration

| Option | Description | Type | Default Value |
| --- | ----------- | ---------| ---- |
| `readonly` | Makes the field not editable | boolean | false |
| `showLabel` | Whether to generate label for the input | boolean | true |
| `icon` | Specify an icon for the field | string | ''
| `type` | Specify the type of value for the field | string | Automatically guessed
| `required` | Whether empty values are allowed | boolean | false
| `helpText` | Specify a description for the input | string | ''
| `label` | Text shown as the label of the input field | string | Automatically generated
| `placeholder` | Specify the text shown as a placeholder for the input field | string | ''
| `validate` | Specify validations for the field | - | Refer section 'Validation' below
| `scale` | Specify whether to show big or small input controls. | number | 1
| `id` | HTML ID of the input | string | Automatically guessed
| `colSpan` | Column span, if the form has more than 1 column | number | 1

Supported field types are:

```typescript
'text' | 'email' | 'password' | 'file' | 'files' | 'select' | 'autocomplete' |
'checkbox' | 'toggle' | 'number' | 'date' | 'time' | 'textarea' | 'markdown' | 'reCaptcha' |
'radio' | 'html' | 'color' | 'datetime-local' | 'month' | 'year' | 'range' | 'reset' | 'tel' | 'url' | 'week' |
'multiselect-checkbox' | 'composite' | 'version' | 'avatar' | 'city' | 'country' | 'ipv4' | 'ipv6' | 'guid' |
'isbn' | 'location' | 'language' | 'money' | 'timezone' | 'title' | 'gallery' | 'submit'
```

## Validation

Validation specs can be added to either on the form level or individual fields.
There are good set of validation functions already included in this library:

```javascript
import {notEmpty, validName} from 'boost-web-forms'

const formConfig = createFormConfig(forObject, {
    fieldsConfig: {
        name: {validate: [notEmpty, validName]}
    }
})
```

The `validate` field would accept:

* A custom method that returns an error message
* A built-in validate method (like `notEmpty`)
* A built-in validator generator (like `getMinLenValidator(4)`)
* An array of, any of the above
* An async server side validator, like:
  
```javascript
async (val) => {
    return 'true' == await (await fetch('http://server.com/username-taken/' + val)).json()
        ? 'User name already taken'
        : ''
}
```

Built-in validation methods:

| Method | Description | For input types | Usage |
| --- | ----------- | ---------| ---- |
| `notEmpty` | Checks if input is empty, null or whitespace | any | `notEmpty` |
| `validName` | Check if string is a valid personal name | string | `validName` |
| `getMinLenValidator` | Returns a validator that checks minimum string length | string | `getMinLenValidator(4)` |
| `getStrongPasswordValidator` | Returns a validator that checks for a password's strength | string | `getStrongPasswordValidator({minLength: 6, specialChars: true})`
| `fileTypeValidator` | Returns a file type validator | file | `fileTypeValidator('image/png')`
| `imgTypeFile` | Checks if an uploaded file is a valid image | file | `imgFileType`
| `maxFileSize` | Checks if an uploaded file size exceeds the given size | file | `maxFileSize`

Using custom validation functions is also easy. 
Just return an error message if it should fail, empty string otherwise.

```javascript
const formConfig = createFormConfig(forObject, {
    fieldsConfig: {
        age: {validate: val => (val < 18 ? 'Age must be 18 or above' : '')}
    }
})
```

Validations can also be done on the form level as:

```javascript
const formConfig = createFormConfig(forObject, {
    validate: val => (val.password != val.confirmPassword ? 'Passwords do not match.' : '')
})
```

To run validations manually:

```javascript
import {validateForm} from 'boost-web-form'

let validationResult = await validateForm(forObj, formConfig)
```

Would give a validation result such as:

```javascript
validationResult = {
    hasErrors: true,
    errorMessage: '', // Form level validation errors, if any
    fields: {
        email: {hasError: true, errorMessage: 'Please, fill in this field.'},
        password: {hasError: true, errorMessage: 'Password is too weak.'},
        name: {hasError: false, errorMessage: ''}
    }
}
```

## Todo

- [ ] Document each field type
- [ ] Easily manage field types
  - [ ] Lots of field types (see https://www.mockaroo.com/)
  - [ ] Make sure renderers support field types
  - [x] How to extend type system and renderers
  - [ ] Manage external dependencies (captcha, gallery, etc.)
- [ ] Provide easier integration with Bootstrap/Tailwind/Bulma/etc.
  - [ ] Various layouts (inline, in-table, disabled vs. readonly)
- [ ] Find easier way to configure form. `formConfig.fieldsConfig.age.type` is too deep
- [ ] Events: form-level and field-level
  - Example:- Being able to run validation up on input blur or submission
- [ ] Groups