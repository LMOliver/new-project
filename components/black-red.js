import { element as e } from '../dynamic-dom/index.js';

/**
 * @param {string} name 
 * @returns {import('../dynamic-dom/types.js').Supported}
 */
export function blackRed(name) {
	return e('span', { class: 'cf-black-red' }, name);
}