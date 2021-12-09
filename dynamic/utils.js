import { apply, flatMap } from '../channel/channel.js';
import { applyChange, SequenceChangeType, unbox } from './dynamic.js';
import { makeBoxDirty, Sequence, useBox } from './dynamic.js';

/**
 * @template T
 * @param {Promise<T>} promise 
 * @returns {import('./dynamic.js').Box<{status:'pending'}|{status:'resolved',value:T}|{status:'rejected',reason:any}>}
 */
export function fromPromise(promise) {
	const [box, set] = useBox(
		/**@type {{status:'pending'}|{status:'resolved',value:T}|{status:'rejected',reason:any}} */
		({ status: 'pending' })
	);
	promise
		.then(value => set({ status: 'resolved', value }))
		.catch(reason => set({ status: 'rejected', reason }));
	return box;
}

/**
 * @template T
 * @param {Sequence<T>} sequence 
 * @returns {import('./dynamic.js').Box<T[]>}
 */
export function wrap(sequence) {
	const q = { current: sequence.current.slice() };
	return makeBoxDirty(q.current, apply(sequence.changes, change => {
		applyChange(q, change);
		return [SequenceChangeType.set, 0, q.current.slice()];
	}));
}


/**
 * @template {{[x:string]:any}} T
 * @param {T} initial 
@returns {{
	values:{
		[x in keyof T]:T[x];
	};
	boxes:{[x in keyof T]:import('./dynamic.js').Box<T[x]>;}
}}
 */
export function useRecord(initial) {
	const value = Object.create(null);
	const boxes = Object.create(null);
	for (const key in initial) {
		if (Object.hasOwnProperty.call(initial, key)) {
			const v = initial[key];
			const [box, set] = useBox(v);
			boxes[key] = box;
			Object.defineProperty(value, key, {
				get: () => unbox(box),
				set,
			});
		}
	}
	return { values: value, boxes };
}

/**@template T @param {import('./dynamic.js').Box<T>} box*/
export function optimizeEqual(box) {
	let current = unbox(box);
	return makeBoxDirty(
		current,
		flatMap(box.changes, (change, callback) => {
			if (!Object.is(change[2], current)) {
				current = change[2];
				callback([SequenceChangeType.set, 0, current]);
			}
		})
	);
}