import {AbstractDomNode, vd} from "boost-web-core";
import {FieldConfig} from "../../Models";

export interface MarkdownInputProps {
    renderer: (src: string) => string
}

export function MarkdownInput(val: any, inputAttrs: any, {renderer}: MarkdownInputProps): AbstractDomNode {
    return vd('div', {style: {display: 'table'}}, [
        vd('style', {}, `
            .boost_markdown_container {
                border: 1px solid #EEE;
            }
            .boost_markdown_editor {
                -moz-appearance: textfield-multiline;
                -webkit-appearance: textarea;
                font: medium -moz-fixed;
                font: -webkit-small-control;
                height: 80px;
                overflow: auto;
                resize: both;
                width: 400px;
                font-family: monospace;
            }
            .boost_markdown_tab_item {
                cursor: pointer;
                padding: 3px 10px;
                font-size: small;
            }
            .boost_markdown_tab_item.active {
                background: #DDD;
                border-top: 2px solid #388feb;
            }
            .boost_markdown_tab_item:hover {
                background: #DDD;
            }
        `),
        vd('textarea', {...inputAttrs, hidden: true, value: `${val == null ? '' : val}`}),
        vd('div', {class: 'boost_markdown_container'}, [
            vd('div', {
                contenteditable: true,
                class: 'boost_markdown_editor',
                onkeydown: e => {
                    if (e.keyCode === 9){
                        e.preventDefault();
                        const range = window.getSelection()!.getRangeAt(0);
                        const tabNode = document.createTextNode("\u00a0\u00a0\u00a0\u00a0");
                        range.insertNode(tabNode);
                        range.setStartAfter(tabNode);
                        range.setEndAfter(tabNode);
                    }
                },
                onchange: e => {
                    const input = document.getElementById(inputAttrs.id) as HTMLTextAreaElement
                    if (input != null)
                        input.value = e.target.innerText
                }
            }, `${val == null ? '' : val}`),
            vd('div', { style: {background: '#EEE'} }, [
                vd('span', {class: 'boost_markdown_tab_item active'}, 'Markdown'),
                vd('span', {class: 'boost_markdown_tab_item'}, 'Preview')
            ])
        ])
    ])
}