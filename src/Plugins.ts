import {FieldConfig, FormConfig} from "./Models";
import {DeepPartial, OneOrMany} from "boost-web-core";
import {AbstractInputProps, AbstractLabelProps, FormLayoutProps} from "./components";
import {AbstractDomNode} from "vdtree";

export interface PluginHooks {
    onCreateFormConfig?: (config: FormConfig) => void
    onCreateFieldConfig?: (fieldConfig: FieldConfig, formConfig?: DeepPartial<FormConfig>) => void
    onTypeGuess?: (fieldId: string, fieldValue: any) => void
    onGetFieldHtmlAttrs?: (fieldConfig: FieldConfig, result: any) => void
    onGetFormHtmlAttrs?: (formConfig: FormConfig, result: any) => void
    onRenderLabel?: (labelProps: AbstractLabelProps) => OneOrMany<AbstractDomNode> | null
    onRenderInput?: (inputProps: AbstractInputProps) => OneOrMany<AbstractDomNode> | null
    onFormLayout?: (layoutProps: FormLayoutProps) => OneOrMany<AbstractDomNode> | null
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
}