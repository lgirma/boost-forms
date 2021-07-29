import {registerPlugin} from "../FormService";

export function onConsoleRendererPlugin() {
    return {
        name: 'On Console Dummy Renderer',
        hooks: {
            onRenderForm: (forObject, config, form, target) => {
                console.log('Rendered', {forObject, config, form, target})
            }
        }
    }
}