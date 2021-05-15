
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
 * Creates a dom elements tree.
 * Example:
 * createDomTree(["p", "Here is a ", ["a", { href:"http://www.google.com/" }, "link"], "."]);
 *
 * Results:
 *  <p>Here is a <a href="http://www.google.com/">link</a>.</p>
 */
export function createDomTree<T>(tag: string, attrs: {}, children?: string|null|Node|Node[]) {
    const elt = document.createElement(tag)
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