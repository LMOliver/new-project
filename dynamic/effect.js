import { makeOnce } from '../channel/channel.js';
import { makeBoxDirty, SequenceChangeType, unbox } from './dynamic.js';

/**
 * @param {(f:<T>(value:import('./dynamic.js').Box<T>)=>T)=>import('../channel/channel.js').Cancel} callback 
 * @param {<T>(box:import('./dynamic.js').Box<T>)=>T} unbox
 */
function runAndCollect(callback, unbox) {
	/**@type {Set<import('./dynamic.js').Box<any>>} */
	const s = new Set();
	return {
		dependencies: s,
		cancel: callback(box => {
			s.add(box);
			return unbox(box);
		}),
	};
};
/**
 * @param {(unbox:<T>(value:import('./dynamic.js').Box<T>)=>T)=>import('../channel/channel.js').Cancel} calculate 
 * @returns {import('../channel/channel.js').Cancel}
 */
export function effect(calculate) {
	let currentCancel = () => { };
	/**@type {Map<import('./dynamic.js').Box<any>,import('../channel/channel.js').Cancel>} */
	const map = new Map();
	function update() {
		const { cancel, dependencies } = runAndCollect(calculate, unbox);
		currentCancel = cancel;
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
	}
	update();
	return () => {
		currentCancel();
		for (const item of map) {
			item[1]();
		}
	};
}