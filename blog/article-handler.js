import { container } from '../components/container.css.js';
import { element as e } from '../dynamic-dom/index.js';
import { articleContent } from './article-component';
import { blogSidebars } from './header.js';
// @ts-ignore
import { root } from './blog.module.css';
/**
 * @param {import('./articles/info.js').Article} article
 * @param {import('../router/index.js').Context} context
 */
export function article(article, context) {
	return {
		head: [
			e('title', article.title)
		],
		body: e('article', { class: root },
			blogSidebars(),
			e('main', { class: container }, articleContent(article)),
		),
	};
}