import {FieldConfig, FormConfig} from "./Models";
import {DeepPartial, OneOrMany} from "boost-web-core";
import {AbstractInputProps, AbstractLabelProps, FormLayoutProps, FieldSetLayoutProps} from "./components";
import {AbstractDomNode} from "vdtree";

export interface FormRenderHooks {

}

export interface PluginHooks {
    onCreateFormConfig?: (config: FormConfig) => void
    onCreateFieldConfig?: (fieldConfig: FieldConfig, formConfig?: DeepPartial<FormConfig>) => void
    onTypeGuess?: (fieldId: string, fieldValue: any) => void
    onGetFieldHtmlAttrs?: (fieldConfig: FieldConfig, result: any) => void
    onGetFormHtmlAttrs?: (formConfig: FormConfig, result: any) => void
    onFormLayout?: (layoutProps: FormLayoutProps, previousResult: AbstractDomNode) => AbstractDomNode | null
    onInputLayout?: (inputProps: AbstractInputProps, previousResult: OneOrMany<AbstractDomNode>) => OneOrMany<AbstractDomNode> | null
    onLabelLayout?: (labelProps: AbstractLabelProps, previousResult: AbstractDomNode) => AbstractDomNode | null
    onFieldSetLayout?: (layoutProps: FieldSetLayoutProps, previousResult: AbstractDomNode) => AbstractDomNode | null
    onRenderForm?: (forObject: any, config: FormConfig, form: AbstractDomNode, target: any) => void
}

export interface FormPlugin {
    name: string
    hooks?: PluginHooks
}

export class FormPluginCollection {
    _plugins: FormPlugin[] = []

    register(plugin: FormPlugin) {
        this._plugins.push(plugin)
    }

    unregister(plugin: FormPlugin) {
        this._plugins = this._plugins.filter(p => p != plugin)
    }

    queryFirst(action: (p: FormPlugin) => any): any {
        for (const plugin of this._plugins) {
            let res = action(plugin)
            if (res) return res
        }
        return null
    }

    runForAll(action: (p: FormPlugin) => any): any {
        for (const plugin of this._plugins)
            action(plugin)
        return null
    }

    pipeThroughAll(action: (p: FormPlugin, prevValue: any) => any, defaultValue: any): any {
        let prev: any = defaultValue
        for (const plugin of this._plugins) {
            let result = action(plugin, prev)
            if (result != null)
                prev = result
        }
        return prev
    }
}

export const globalPlugins = new FormPluginCollection()