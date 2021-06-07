import {AbstractDomNode, vd} from "boost-web-core";

export interface SourceCodeInputProps {
    renderer: (src: string) => string
}

export function SourceCodeInput(val: any, inputAttrs: any, {renderer}: SourceCodeInputProps): AbstractDomNode {
    return vd('div', {style: {display: 'table'}}, [
        vd('style', {}, `
            .boost_sourcecode_container {
                border: 1px solid #EEE;
            }
            .boost_sourcecode_editor {
                -moz-appearance: textfield-multiline;
                -webkit-appearance: textarea;
                background: #FEFEFE;
                font: medium -moz-fixed;
                font: -webkit-small-control;
                height: 80px;
                overflow: auto;
                resize: both;
                width: 400px;
                font-family: monospace;
                counter-reset: line;
            }
        `),
        vd('textarea', {...inputAttrs, hidden: true, value: `${val == null ? '' : val}`}),
        vd('div', {class: 'boost_sourcecode_container'}, [
            vd('pre', {
                contenteditable: true,
                spellcheck: false,
                class: 'boost_sourcecode_editor',
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
            }, `${val == null ? '' : val}`)
        ])
    ])
}