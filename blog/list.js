import { container } from '../components/container.css.js';
// @ts-ignore
import { root } from './blog.module.css';
import { link } from '../components/link.js';
import { element as e, template } from '../dynamic-dom/index.js';
import { articles, getTag } from './articles/info.js';
import { blogSidebars, blogTitle } from './header.js';

/**
 * @type {import('../router/index.js').Handler}
 */
export function list(context) {
	return {
		head: [
			blogTitle
		],
		body: [
			e('article', { class: root },
				blogSidebars(),
				e('main', { class: container },
					e('ul',
						articles.map(({ id, title, time, description, tags }) =>
							e('li',
								e('p',
									link(`./OI/${id}`, title),
									template`（${time.toLocaleDateString()}）`,
									tags.map(getTag).map(({ showTag = true, name }) => showTag ? `[${name}]` : ''),
								),
								e('p',
									e('q', description),
								)
							),
						),
					),
				),
			),
		],
	};
}