export type AbstractDomNode = AbstractDomElement|string

export type Nullable<T> = T|null

export type DomElementChildren = AbstractDomNode[]

export type DomElementChildrenFrom = Nullable<AbstractDomNode>|Nullable<AbstractDomNode>[]

export interface AbstractDomElement {
    tag: string
    attrs?: {[p: string]: any}
    children?: DomElementChildren
}

/**
 * Creates an abstract dom elements tree.
 * Example:
 * vdom('p', {}, [
 *      vdom("a", { href:"http://www.google.com/" }, "link"),
 *      "."
 * ]);
 *
 * Results:
 *  <p>Here is a <a href="http://www.google.com/">link</a>.</p>
 */
export function vdom(tag: string,
                     attrs: {} = {},
                     children: DomElementChildrenFrom = null) : AbstractDomElement {
    const elt: AbstractDomElement = {tag, attrs: {}, children: []}
    attrs ??= {}
    for (const k in attrs) {
        if (attrs[k] != undefined)
            elt.attrs[k] = attrs[k]
    }

    if (children != null) {
        if (typeof children === 'string')
            elt.children.push(children)
        else if (children.constructor === Array) {
            elt.children.push(...children)
        } else {
            elt.children.push(children as AbstractDomElement)
        }
    }
    return elt
}

export function toJsx<T>(reactCreateElement, root: AbstractDomElement, key?: any): T {
    let attrs: any = {}
    if (key != null) attrs.key = key;
    for (const [k, v] of Object.entries({...root.attrs})) {
        if (k === 'class') attrs.className = v
        //else if (k == 'style') attrs.style = v
        else if (k == 'for') attrs.htmlFor = v
        else if (k == 'value') attrs.defaultValue = v
        else if (k == 'checked') attrs.defaultChecked = v
        else attrs[k] = v
    }
    if (root.children && root.children.length > 1)
        return reactCreateElement(root.tag, attrs,
            root.children.map((c, i) => (typeof (c) === 'string' || c == null) ? c : toJsx(reactCreateElement, c, i)))
    else if (root.children && root.children.length == 1) {
        let c = root.children[0]
        if (root.tag === 'textarea')
            return reactCreateElement(root.tag, {...attrs, defaultValue: c})
        else
            return reactCreateElement(root.tag, attrs, (typeof(c) === 'string' || c == null) ? c : toJsx(reactCreateElement, c))
    }
    else
        return reactCreateElement(root.tag, attrs)
}

export function toHtmlDom<T extends HTMLElement>(documentCreateElement, document, root: AbstractDomElement): T {
    const result = documentCreateElement.call(document, root.tag) as HTMLElement
    for (const k in root.attrs) {
        const val = root.attrs[k]
        if (k === 'style' && typeof(val) === 'object') {
            for (const [sk, sv] of Object.entries(val)) {
                if (sv != null)
                    result.style.setProperty(sk, `${sv}`);
            }
        }
        else
            result.setAttribute(k, val)
    }
    for (const child of root.children) {
        if (child != null) {
            if (typeof child === 'string')
                result.append(child)
            else {
                result.appendChild(toHtmlDom(documentCreateElement, document, child))
            }
        }
    }

    return result as T;
}

export function toHtmlString(root: AbstractDomElement): string {
    let result = `<${root.tag}`
    for (const k in root.attrs) {
        const val = root.attrs[k]
        if (k === 'style' && typeof(val) === 'object') {
            for (const [sk, sv] of val) {
                if (sv != null)
                    result += ` ${sk}="${sv}"`
            }
        }
        result += ` ${k}="${val}"`
    }
    result += ">"

    for (const child of root.children) {
        if (child != null) {
            if (typeof child === 'string')
                result += child
            else {
                result += toHtmlString(child)
            }
        }
    }

    result += `</${root.tag}>`

    return result;
}