
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

export function isDate(str: string){
    const _regExp  = new RegExp('[1-9][0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9]');
    return _regExp.test(str);
}

export type DomElement = (string|null|Node)

/**
 * Creates a dom elements tree.
 * Example:
 * createDomTree('p', {},
 *      createDomTree("a", { href:"http://www.google.com/" }, "link"),
 *      ".");
 *
 * Results:
 *  <p>Here is a <a href="http://www.google.com/">link</a>.</p>
 */
export function createDomTree<T extends DomElement>(tag: string, attrs: {} = {}, children: DomElement|DomElement[] = []) : T {
    const elt = document.createElement(tag)
    attrs ??= {}
    for (const attr in attrs) {
        if (attrs[attr] != undefined)
        elt.setAttribute(attr, attrs[attr])
    }
    if (children != null) {
        if (typeof children == 'string')
            elt.append(children)
        else if (children.constructor === Array) {
            elt.append(...children)
        } else {
            elt.appendChild(children as Node)
        }
    }
    return elt as unknown as T;
}

export function uuid() {
    // UUID v4
    return (([1e7] as any)+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    )
}