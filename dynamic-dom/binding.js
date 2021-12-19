import { weakBind } from '../channel/channel.js';
import { makeBoxDirty, SequenceChangeType, unbox } from '../dynamic/dynamic.js';

/**
 * @param {HTMLInputElement|HTMLTextAreaElement} input 
 * @param {[SequenceChangeType.set,0,string]} change
 */
function applyBoxChange(input, [, , value]) {
	input.value = value;
}

/**
 * @param {[import('../dynamic/dynamic.js').Box<string>,import('../channel/channel.js').Callback<string>]} boxAndSetter
 * @param {HTMLInputElement|HTMLTextAreaElement} input 
 */
export function bind([box, set], input) {
	input.value = unbox(box);
	weakBind(input, box.changes, applyBoxChange);
	input.addEventListener('input', _event => {
		set(input.value);
	});
	return input;
}

/**
 * @param {HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement} input 
 */
export function valueBox(input) {
	return makeBoxDirty(input.value, callback => {
		const listener = () => callback([SequenceChangeType.set, 0, input.value]);
		input.addEventListener('input', listener);
		return () => {
			input.removeEventListener('input', listener);
		};
	});
}