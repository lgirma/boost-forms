import {RenderFormOptions} from "./Common";

export const Bootstrap5 : RenderFormOptions = {
    labelAttrs: f => {
        if (f.type === 'checkbox' || f.type === 'radio')
            return {class: 'form-check-label'}
        else return {class: 'form-label'}
    },
    inputAttrs: f => {
        let result : any = {};

        if (f.type === 'select')
            result = {
                class: `form-select${f.scale > 1 ? ' form-select-lg' : ''}${(f.scale && f.scale < 1) ? ' form-select-sm' : ''}`
            }
        else if (f.type === 'checkbox' || f.type === 'radio')
            result = { /*class: 'form-check-input'*/ }
        else
            result = {
                class: `form-control${f.scale > 1 ? ' form-control-lg' : ''}${(f.scale && f.scale < 1) ? ' form-control-sm' : ''}`
            }

        if (f.type === 'color')
            result.class += ' form-control-color'

        return result
    },
    fieldSetAttrs: f => {
        if (f.type === 'checkbox' || f.type === 'radio')
            return {/*class: 'form-check'*/}
        return {}
    },
    submitAttrs: (forObj, options) => {
        return {class: 'btn btn-primary'}
    }
}

export const Bootstrap4 : RenderFormOptions = {
    labelAttrs: f => {
        if (f.type === 'checkbox' || f.type === 'radio')
            return {class: 'form-check-label'}
        else return {class: 'form-label'}
    },
    inputAttrs: f => {
        let result : any = {};

        if (f.type === 'checkbox' || f.type === 'radio')
            result = { class: 'form-check-input' }
        else if (f.type === 'file' || f.type === 'files')
            result = { class: 'form-control-file' }
        else if (f.type === 'range')
            result = { class: 'form-control-range' }
        else
            result = {
                class: `form-control${f.scale > 1 ? ' form-control-lg' : ''}${(f.scale && f.scale < 1) ? ' form-control-sm' : ''}`
            }

        if (f.type === 'color')
            result.class += ' form-control-color'

        return result
    },
    fieldSetAttrs: f => {
        if (f.type === 'checkbox' || f.type === 'radio')
            return {/*class: 'form-check'*/}
        return {}
    },
    submitAttrs: (forObj, options) => {
        return {class: 'btn btn-primary'}
    }
}

export const Bulma : RenderFormOptions = {
    labelAttrs: f => {
        if (f.type === 'checkbox' || f.type === 'radio')
            return {/*class: f.type*/}
        else return {class: 'label'}
    },
    inputAttrs: f => {
        let result : any = {};

        if (f.type === 'textarea')
            result = {class: 'textarea'}
        else if (f.type !== 'checkbox' && f.type !== 'radio')
            result = {
                class: `input${f.scale > 1 ? ' is-large' : ''}${(f.scale && f.scale < 1) ? ' is-small' : ''}`
            }

        if (f.type === 'color')
            result.class += ' form-control-color'

        return result
    },
    fieldSetAttrs: f => {
        if (f.type === 'select' || f.type === 'checkbox' || f.type === 'radio')
            return {/*class: 'select'*/}
        return {class: 'field'}
    },
    submitAttrs: (forObj, options) => {
        return {class: 'btn is-primary'}
    }
}

export const MaterialDesignLite : RenderFormOptions = {
    labelAttrs: f => {
        if (f.type === 'checkbox')
            return {class: 'mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect'}
        if (f.type === 'radio')
            return {class: 'demo-list-radio mdl-radio mdl-js-radio mdl-js-ripple-effect'}
        return {class: 'mdl-textfield__label'}
    },
    inputAttrs: f => {
        let result : any = {};

        if (f.type === 'textarea')
            result = {class: 'mdl-textfield__input'}
        else if (f.type === 'checkbox')
            result = {class: 'mdl-checkbox__input'}
        else if (f.type === 'radio')
            result = {class: 'mdl-radio__button'}
        else
            result = { class: `mdl-textfield__input` }

        return result
    },
    fieldSetAttrs: f => {
        return {class: 'mdl-textfield mdl-js-textfield mdl-textfield--floating-label'}
    },
    submitAttrs: (forObj, options) => {
        return {class: 'mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--colored'}
    }
}