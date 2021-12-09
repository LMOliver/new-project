import { makeOnce } from '../channel/channel.js';
import { makeBoxDirty, SequenceChangeType, unbox } from './dynamic.js';

/**
 * @template U
 * @param {(f:<T>(value:import('./dynamic.js').Box<T>)=>T)=>U} callback 
 */
function runAndCollect(callback) {
	/**@type {Set<import('./dynamic.js').Box<any>>} */
	const s = new Set();
	return {
		result: callback(box => {
			s.add(box);
			return unbox(box);
		}),
		dependencies: s,
	};
};
/**
 * @template {(unbox:<T>(value:import('./dynamic.js').Box<T>)=>T)=>any} F
 * @param {F} calculate 
 * @returns {import('./dynamic.js').Box<ReturnType<F>>}
 */
export function computed(calculate) {
	const { result, dependencies } = runAndCollect(calculate);
	return makeBoxDirty(
		result,
		callback => {
			const map = new Map([...dependencies].map(box => [box, box.changes(update)]));
			function update() {
				const { result, dependencies } = runAndCollect(calculate);
				for (const [box, cancel] of map) {
					if (!dependencies.has(box)) {
						cancel();
						map.delete(box);
					}
				}
				for (const box of dependencies) {
					if (!map.has(box)) {
						map.set(box, box.changes(update));
					}
				}
				callback([SequenceChangeType.set, 0, result]);
			}
			return () => {
				for (const item of map) {
					item[1]();
				}
			};
		}
	);
}