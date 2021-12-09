import { authClient } from '../auth-client/index.js';
import { container } from '../components/container.css.js';
import { link } from '../components/link.js';
import { element as e } from '../dynamic-dom/index.js';
import { imageList } from './image-list.js';

/**@type {import('../router').Handler} */
export function drawClient(context) {
	return {
		head: [
			e('title', '绘板'),
		],
		body: [
			e('article', { class: container },
				e('h1', link('/', 'LMOliver'), '/绘板'),
				authClient(),
				imageList(),
			)
		],
	};
}