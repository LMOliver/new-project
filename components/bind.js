import { makeBoxDirty, SequenceChangeType } from '../dynamic/dynamic.js';

/**
 * @template T
 * @param {HTMLElement & {value:T}} element 
 * @returns {import('../dynamic/dynamic.js').Box<T>} 
 */
export function bindValue(element) {
	return makeBoxDirty(
		element.value,
		callback => {
			const listener = () => callback([SequenceChangeType.set, 0, element.value]);
			element.addEventListener('change', listener);
			return () => {
				element.removeEventListener('change', listener);
			};
		}
	);
}