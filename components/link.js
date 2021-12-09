import { element as e } from '../dynamic-dom/index.js';
import { pushHistory, replaceHistory } from './path.js';

/**
 * @param {import('./path.js').Path} path
 * @param {import('../dynamic-dom/types.js').Supported[]} children
 */
export function link(path, ...children) {
	const element = e('a', { href: path }, ...children);
	element.addEventListener('click', event => {
		pushHistory(path);
		event.preventDefault();
	});
	return element;
}
/**
 * @param {import('./path.js').Path} path
 * @param {import('../dynamic-dom/types.js').Supported[]} children
 */
export function replaceLink(path, ...children) {
	const element = e('a', { href: path }, ...children);
	element.addEventListener('click', event => {
		replaceHistory(path);
		event.preventDefault();
	});
	return element;
}