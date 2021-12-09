/**
 * @typedef {string[]} Item
 * @typedef {{[type:string]:Item}} FuFaConfig
 */

import { sample } from '../utils/index.js';

/**
 * @param {FuFaConfig} config
 */
export function produce(config) {
	const strings = Object.fromEntries(Object.entries(config).map(([key, value]) => [key, value.map(x => `${/^[a-zA-Z]/.test(x) ? ' ' : ''}${x}${/[a-zA-Z]$/.test(x) && !x.includes('$') ? ' ' : ''}`)]));
	let paragraph = '$@';
	while (true) {
		const newParagraph = paragraph.replace(/\$[a-zA-Z0-9@]+/g, s => {
			if (strings[s.slice(1)] === undefined) {
				throw Object.assign(new TypeError(`Cannot transform ${s}`));
			}
			return sample(strings[s.slice(1)]);
		});
		if (newParagraph === paragraph) {
			return paragraph;
		}
		paragraph = newParagraph;
	}
}