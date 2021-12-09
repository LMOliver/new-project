export type Callback<T> = (value: T) => void;
export type Cancel = Callback<void>;
export type Source<T> = (listener: Callback<T>) => Cancel;

export declare const empty: Source<never>;
export function makeShared<T>(original: Source<T>): Source<T>;
export function makeOnce<T>(original: Source<T>): Source<T>;
export function apply<T, U>(original: Source<T>, transform: (value: T) => U): Source<U>;
export function flatMap<T, U>(original: Source<T>, callback: (value: T, callback: Callback<U>) => void): Source<U>;
export function weakBind<T extends object, U>(object: T, source: Source<U>, callback: (object: T, value: U) => void): T;
export function onceChannel<T>(): [Source<T>, Callback<T>];