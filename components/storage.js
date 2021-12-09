import { weakBind } from '../channel/channel.js';
import { SequenceChangeType, useBox } from '../dynamic/dynamic.js';

/**
 * @param {string} key
 * @param {Storage} storage
 * @returns {[import('../dynamic/dynamic.js').Box<string|null>,(newValue:string|null)=>void]}
 */
export function useStorage(storage, key) {
	const [box, set] = useBox(storage.getItem(key));
	weakBind(box, callback => {
		/**
		 * @param {StorageEvent} event 
		 */
		const listener = event => {
			if (event.storageArea === storage && event.key === key) {
				callback([SequenceChangeType.set, 0, event.newValue]);
			}
		};
		window.addEventListener('storage', listener);
		return () => {
			window.removeEventListener('storage', listener);
		};
	}, (_, newValue) => set(newValue));
	return [box, (/** @type {string | null} */ newValue) => {
		if (newValue !== null) {
			storage.setItem(key, newValue);
		}
		else {
			storage.removeItem(key);
		}
		set(newValue);
	}];
}