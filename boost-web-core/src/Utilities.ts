
export function humanize(str: string) {
    return str
        .replace(/^[\s_]+|[\s_]+$/g, '')
        .replace(/[_\s]+/g, ' ')
        .replace(/([A-Z])/g, ' $1')
        .replace(/^[a-z]/, function(m) { return m.toUpperCase(); })
        .trim();
}

export function getFriendlyFileSize(bytes: number) {
    if (bytes < 1024)
        return bytes + ' bytes'
    else if (bytes < (1024**2))
        return Math.round(10* bytes / 1024)/10 + ' Kb'
    else if (bytes < (1024**3))
        return Math.round(10* bytes / (1024**2))/10 + ' Mb'
    else if (bytes < (1024**4))
        return Math.round(10* bytes / (1024**3))/10 + ' Gb'
    else
        return Math.round(10* bytes / (1024**4))/10 + ' Tb'
}

/**
 * Checks if the given string is empty or white space only.
 * @param str
 */
export function isEmpty(str: string) {
    return str == null || str.trim().length == 0;
}

export function isArray(a) {
    return a != null && a.constructor === Array;
}

/**
 * Matches date string in the formats YYYY/MM/DD or YYYY-MM-DD
 * @param str
 */
export function isDate(str: string){
    const _regExp  = new RegExp('(((19|20)([2468][048]|[13579][26]|0[48])|2000)[/-]02[/-]29|((19|20)[0-9]{2}[/-](0[4678]|1[02])[/-](0[1-9]|[12][0-9]|30)|(19|20)[0-9]{2}[/-](0[1359]|11)[/-](0[1-9]|[12][0-9]|3[01])|(19|20)[0-9]{2}[/-]02[/-](0[1-9]|1[0-9]|2[0-8])))');
    return _regExp.test(str);
}

export function isTime(str: string){
    const _regExp  = new RegExp('([01][0-9]|2[0-3]):([012345][0-9])((:([012345][0-9]))|(\\sAM)|(\\sam)|(\\sPM)|(\\spm))');
    return _regExp.test(str);
}

export function isDateTime(str: string){
    const _regExp  = new RegExp('((((19|20)([2468][048]|[13579][26]|0[48])|2000)-02-29|((19|20)[0-9]{2}-(0[4678]|1[02])-(0[1-9]|[12][0-9]|30)|(19|20)[0-9]{2}-(0[1359]|11)-(0[1-9]|[12][0-9]|3[01])|(19|20)[0-9]{2}-02-(0[1-9]|1[0-9]|2[0-8])))\\s([01][0-9]|2[0-3]):([012345][0-9]):([012345][0-9]))$');
    return _regExp.test(str);
}

export function isYear(str: string){
    const _regExp  = new RegExp('[1-2][0-9][0-9][0-9]$');
    return _regExp.test(str);
}

export type DomElementChildren = (AbstractDomElement|string)[]

export type DomElementChildrenFrom = string|AbstractDomElement|null|(AbstractDomElement|string)[]

export interface AbstractDomElement {
    tag: string
    attrs?: {[p: string]: any}
    children?: DomElementChildren
}

/**
 * Creates an abstract dom elements tree.
 * Example:
 * createAbstractDom('p', {}, [
 *      createAbstractDom("a", { href:"http://www.google.com/" }, "link"),
 *      "."
 * ]);
 *
 * Results:
 *  <p>Here is a <a href="http://www.google.com/">link</a>.</p>
 */
export function createAbstractDom(tag: string,
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
        else if (k == 'style') attrs.STYLE = v
        else if (k == 'for') attrs.htmlFor = v
        else if (k == 'value') attrs.defaultValue = v
        else if (k == 'checked') attrs.defaultChecked = v
        else attrs[k] = v
    }
    if (root.children && root.children.length > 1)
        return reactCreateElement(root.tag, attrs,
            root.children.map((c, i) => (typeof(c) === 'string' || c == null) ? c : toJsx(reactCreateElement, c, i)))
    else if (root.children && root.children.length == 1) {
        let c = root.children[0]
        return reactCreateElement(root.tag, attrs, (typeof(c) === 'string' || c == null) ? c : toJsx(reactCreateElement, c))
    }
    else
        return reactCreateElement(root.tag, attrs)
}

export function toHtmlDom<T extends Node>(documentCreateElement, document, root: AbstractDomElement): T {
    const result = documentCreateElement.call(document, root.tag)
    for (const k in root.attrs) {
        result.setAttribute(k, root.attrs[k])
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
        result += ` ${k}="${root.attrs[k]}"`
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

export function uuid() {
    // UUID v4
    return (([1e7] as any)+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    )
}