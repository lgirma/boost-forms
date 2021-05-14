
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