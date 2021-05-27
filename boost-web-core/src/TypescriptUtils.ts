export type Nullable<T> = T|null|undefined

export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Dict<TValue> = {[k: string]: TValue}

export type OneOrMany<T> = T|T[]