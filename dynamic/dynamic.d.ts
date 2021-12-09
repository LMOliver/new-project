import { Callback, Source } from '../channel';
export { computed } from './computed.js';
export { fromPromise, useRecord } from './utils.js';

export enum SequenceChangeType {
	insert = 0,
	set = 1,
	delete = 2,
}

export type SequenceChange<T>
	= [type: SequenceChangeType.insert, position: number, value: T]
	| [type: SequenceChangeType.set, position: number, value: T]
	| [type: SequenceChangeType.delete, position: number, value: any];

export class Sequence<T> {
	constructor(current: T[], changes: Source<SequenceChange<T>>);
	readonly current: readonly T[];
	readonly changes: Source<SequenceChange<T>>;
}

export type Box<T> = Sequence<T> & { changes: Source<[SequenceChangeType.set, 0, T]>; };

export function applyChange<T>(sequence: { current: T[]; }, change: SequenceChange<T>): void;
export function makeSequenceDirty<T>(current: T[], changes: Source<SequenceChange<T>>): Sequence<T>;
export function map<T, U>(sequence: Box<T>, transfrom: (value: T) => U): Box<U>;
export function map<T, U>(sequence: Sequence<T>, transfrom: (value: T) => U): Sequence<U>;
export function flat<T>(sequence: Box<Box<T>>): Box<T>;
export function flat<T>(sequence: Sequence<Sequence<T>>): Sequence<T>;

export function makeBoxDirty<T>(value: T, changes: Source<[SequenceChangeType.set, 0, T]>): Box<T>;
export function makeConstantBox<T>(value: T): Box<T>;
export function unbox<T>(box: Box<T>): T;
export function useBox<T>(value: T): [Box<T>, Callback<T>];
export function useSequenceDirty<T>(value: T[]): [Sequence<T>, Callback<SequenceChange<T>>];
export function useSequence<T>(value: readonly T[]): [Sequence<T>, Callback<SequenceChange<T>>];