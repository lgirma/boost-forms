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
            result = { class: 'form-check-input' }
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
            return {class: 'form-check'}
        return {}
    },
    submitAttrs: (forObj, options) => {
        return {class: 'btn btn-primary'}
    }
}