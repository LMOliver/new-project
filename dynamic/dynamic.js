import { apply, empty, makeOnce, makeShared, onceChannel, weakBind } from '../channel';
export { computed } from './computed.js';
export { fromPromise, useRecord } from './utils.js';

/**
 * @enum {0|1|2}
 */
export const SequenceChangeType = Object.freeze({
	insert:/**@type {0} */(0),
	set:/**@type {1} */(1),
	delete:/**@type {2} */(2),
});

/**
 * @template T
 * @typedef {import('./dynamic.js').SequenceChange<T>} SequenceChange
 */
/**
 * @template T
 * @typedef {import('./dynamic.js').Box<T>} Box
 */

/**
 * @template T
 * @param {{current:T[]}} sequence 
 * @param {SequenceChange<T>} change
 */
export function applyChange(sequence, [type, position, value]) {
	switch (type) {
		case SequenceChangeType.insert: {
			// @ts-ignore
			sequence.current.splice(position, 0, value);
			break;
		}
		case SequenceChangeType.set: {
			// @ts-ignore
			sequence.current[position] = value;
			break;
		}
		case SequenceChangeType.delete: {
			sequence.current.splice(position, 1);
			break;
		}
	}
}
/**
 * @template T
 */
export class Sequence {
	/**
	 * @param {T[]} current NO CLONE!
	 * @param {import('../channel').Source<SequenceChange<T>>} changes UNSHARED!
	 */
	constructor(current, changes) {
		this.current = current;
		this.changes = makeShared(changes);
		return weakBind(this, this.changes, applyChange);
	}
}

/**
 * @template T
 * @param {T[]} current NO CLONE!
 * @param {import('../channel').Source<SequenceChange<T>>} changes UNSHARED!
 */
export function makeSequenceDirty(current, changes) {
	return new Sequence(current.slice(), changes);
}

/**
 * @template T
 * @param {Sequence<Sequence<T>>} sequence
 */
export function flat({ current, changes }) {
	return makeSequenceDirty(
		current.flatMap(s => s.current),
		makeOnce(callback => {
			/**
			 * @typedef {{index:number,offset:number,cancel:import('../channel').Cancel}} SNode
			 * @type {SNode[]}
			 */
			let nodes = new Array(current.length);
			let size = 0;
			/**
			 * @param {import('../channel').Source<SequenceChange<T>>} changes
			 * @param {number} index
			 * @param {number} offset
			 */
			function makeNode(changes, index, offset) {
				const node = {
					index,
					offset,
					cancel: changes(change => {
						switch (change[0]) {
							case SequenceChangeType.insert: {
								callback([SequenceChangeType.insert, change[1] + node.offset, change[2]]);
								for (let i = node.index + 1; i < nodes.length; i++) {
									nodes[i].offset += 1;
								}
								size += 1;
								break;
							}
							case SequenceChangeType.set: {
								callback([SequenceChangeType.set, change[1] + node.offset, change[2]]);
								break;
							}
							case SequenceChangeType.delete: {
								callback([SequenceChangeType.delete, change[1] + node.offset, null]);
								for (let i = node.index + 1; i < nodes.length; i++) {
									nodes[i].offset -= 1;
								}
								size -= 1;
							}
						}
					})
				};
				return node;
			}
			for (let index = 0; index < current.length; index++) {
				nodes[index] = makeNode(current[index].changes, index, size);
				size += current[index].current.length;
			}
			/**
			 * @param {number} position
			 */
			function getOffset(position) {
				return position === nodes.length ? size : nodes[position].offset;
			}
			const cancel = changes(change => {
				switch (change[0]) {
					case SequenceChangeType.insert: {
						const offset = getOffset(change[1]);
						for (let i = 0; i < change[2].current.length; i++) {
							callback([SequenceChangeType.insert, offset + i, change[2].current[i]]);
						}
						for (let i = change[1]; i < nodes.length; i++) {
							nodes[i].index++;
							nodes[i].offset += change[2].current.length;
						}
						size += change[2].current.length;
						nodes.splice(change[1], 0, makeNode(change[2].changes, change[1], offset));
						break;
					}
					case SequenceChangeType.set: {
						const offset = nodes[change[1]].offset;
						const oldSize = getOffset(change[1] + 1) - offset;
						const newSize = change[2].current.length;
						const delta = newSize - oldSize;
						if (oldSize < newSize) {
							for (let i = 0; i < oldSize; i++) {
								callback([SequenceChangeType.set, offset + i, change[2].current[i]]);
							}
							for (let i = oldSize; i < newSize; i++) {
								callback([SequenceChangeType.insert, offset + i, change[2].current[i]]);
							}
						}
						else {
							for (let i = 0; i < newSize; i++) {
								callback([SequenceChangeType.set, offset + i, change[2].current[i]]);
							}
							for (let i = oldSize - 1; i >= newSize; i--) {
								callback([SequenceChangeType.delete, offset + i, null]);
							}
						}
						if (delta !== 0) {
							for (let i = change[1] + 1; i < nodes.length; i++) {
								nodes[i].offset += delta;
							}
							size += delta;
						}
						nodes[change[1]].cancel();
						nodes[change[1]] = makeNode(change[2].changes, change[1], offset);
						break;
					}
					case SequenceChangeType.delete: {
						const offset = nodes[change[1]].offset;
						const oldSize = getOffset(change[1] + 1) - offset;
						for (let i = oldSize - 1; i >= 0; i--) {
							callback([SequenceChangeType.delete, offset + i, null]);
						}
						size -= oldSize;
						nodes[change[1]].cancel();
						nodes.splice(change[1], 1);
						for (let i = change[1]; i < nodes.length; i++) {
							nodes[i].index--;
							nodes[i].offset -= oldSize;
						}
						break;
					}
				}
			});
			return () => {
				for (const a of nodes) {
					a.cancel();
				}
				cancel();
			};
		})
	);
}


/**
 * @template T,U
 * @param {Sequence<T>} sequence
 * @param {(value:T)=>U} transform
 */
export function map({ current, changes }, transform) {
	return makeSequenceDirty(
		current.map(transform),
		apply(changes, change => {
			switch (change[0]) {
				case SequenceChangeType.insert: {
					return [SequenceChangeType.insert, change[1], transform(change[2])];
				}
				case SequenceChangeType.set: {
					return [SequenceChangeType.set, change[1], transform(change[2])];
				}
				case SequenceChangeType.delete: {
					return change;
				}
			}
			throw new TypeError('impossible');
		}),
	);
}

/**
 * @template T
 * @param {T} value 
 * @param {import('../channel').Source<[(typeof SequenceChangeType)['set'],0,T]>} changes 
 * @returns {Box<T>}
 */
export function makeBoxDirty(value, changes) {
	return /**@type {Box<T>} */(makeSequenceDirty([value], changes));
}

/**
 * @template T
 * @param {T} value
 */
export function makeConstantBox(value) {
	return makeBoxDirty(value, empty);
}

/**
 * @template T
 * @param {T} value 
 * @returns {[Box<T>,import('../channel').Callback<T>]}
 */
export function useBox(value) {
	const [receive, emit] = onceChannel();
	return [makeBoxDirty(value, receive), value => emit([SequenceChangeType.set, 0, value])];
}

/**
 * @template T
 * @param {T[]} value 
 * @returns {[Sequence<T>,import('../channel').Callback<SequenceChange<T>>]}
 */
export function useSequenceDirty(value) {
	const [receive, emit] = onceChannel();
	return [makeSequenceDirty(value, receive), emit];
}
/**
 * @template T
 * @param {T[]} value 
 * @returns {[Sequence<T>,import('../channel').Callback<SequenceChange<T>>]}
 */
export function useSequence(value) {
	return useSequenceDirty(value.slice());
}

/**
 * @template T
 * @param {Box<T>} box
 * @returns {T}
 */
export function unbox({ current: [result] }) {
	return result;
}