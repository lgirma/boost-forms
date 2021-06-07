import {AbstractDomNode, vd} from "boost-web-core";
import {FieldConfig} from "../../Models";

export interface RatingProps {
    max?: number
}

export function Rating(val: any, inputAttrs: any, {max = 5}: RatingProps = {max: 5}): AbstractDomNode {
    return vd('div', {style: {display: 'table'}}, [
        vd('style', {}, `
            .boost_star:hover { color: darkorange }
            .boost_star {
                margin: 0px 2px; 
                color: orange; 
                cursor: pointer;
                font-size: 1.5em;
            }
        `),
        vd('input', {...inputAttrs, hidden: true, required: false, type: 'number', value: `${val == null ? '' : val}`}),
        vd('div', {}, new Array(max).fill(0).map((n, i) =>
            vd('span', {
                class: 'boost_star',
                title: `${i+1} / ${max}`,
                onclick: e => {
                    const newVal = i+1
                    let input = document.getElementById(inputAttrs.id) as HTMLInputElement
                    if (input != null) input.value = newVal.toString();
                    ([...e.target.parentElement.children])
                        .forEach((elt, eltIndex) => elt.innerText = newVal > eltIndex ? '★' : '☆')
                }
            }, ((val??0) > i ? '★' : '☆'))))
    ])
}