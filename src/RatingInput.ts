import {FieldConfig} from "./Models";

export function ratingInput(field: FieldConfig, value = 0): string {
    return new Array(field.max ?? 5)
        .fill(0)
        .map((v, i) =>
            `<span style="cursor: pointer;font-size: 1.5em; color: darkorange;">${(value > i ? '★' : '☆')}</span>`).join('')
    + `<input hidden name="${field.name ?? field.id}" id="${field.id}" type="number" value="${value}">`
}