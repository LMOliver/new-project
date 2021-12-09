import { dangerouslyParseHTML } from '../components/html.js';
import { link } from '../components/link.js';
import { loading } from '../components/loading.js';
import { element as e } from '../dynamic-dom/index.js';
import { isLocal } from '../utils/index.js';

/**
 * @param {import('./articles/info.js').Article} article
 */
async function renderContent(article) {
	const renderModule = import('./blog-markdown.js');
	//@ts-ignore for import.meta
	const markdown = await (await fetch(new URL(`./articles/${article.id}.md`, import.meta.url).toString())).text();
	const elements = dangerouslyParseHTML((await renderModule).blogArticleRender(markdown));
	for (const element of elements) {
		for (const a of element.querySelectorAll('a')) {
			if (isLocal(a.href)) {
				a.replaceWith(link(a.href, [...a.childNodes]));
			}
		}
	}
	return elements;
}

/**
 * @param {import('./articles/info.js').Article} article
 */
export function articleContent(article) {
	const content = renderContent(article);
	return [
		e('h2', article.title),
		loading(
			content,
			() => [
				e('p', '少女祈祷中……'),
			],
			reason => [
				e('p', '出了点小问题。'),
				e('p', reason.message),
			]
		),
	];
}