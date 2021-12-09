import { element as e } from '../../dynamic-dom';
import { replaceLink } from '../../components/link.js';
import { computed } from '../../dynamic';
/**@type {import('../../router/index.js').Handler} */
export function notfound({ path }) {
	return {
		head: [
			e('title', '404'),
		],
		body: [
			e('h1', '404'),
			e('p', computed($ => {
				const { routing, original } = $(path);
				return [
					original.slice(0, -routing.length),
					e('span', { style: 'color:red;' }, routing),
				];
			})),
			e('p', e('button', { $click: () => window.history.back() }, '返回')),
			e('p', replaceLink('/', '主页')),
		],
	};
}