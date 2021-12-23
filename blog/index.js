import 'katex/dist/katex.min.css';
import { router } from '../router/index.js';
import { prepandInHead } from '../router/middlewares.js';
import { articleRouter } from './article-router.js';
import { list } from './list.js';

/**
 * @type {import('../router/index.js').Handler}
 */
export const blog = prepandInHead(
	// e('link', {
	// 	rel: 'stylesheet',
	// 	// @ts-ignore
	// 	href: new URL('./node_modules/katex/dist/katex.min.css', import.meta.url).toString(),
	// }),
	// e('link', {
	// 	rel: 'stylesheet',
	// 	// @ts-ignore
	// 	href: 'https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/katex.min.css',
	// }),
)(
	router([
		['/', list],
		['', articleRouter()]
	])
);