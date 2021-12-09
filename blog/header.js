// @ts-ignore
import { friends, hitokoto as hitokotoClass } from './blog.module.css';
import { hitokoto } from '../components/hitokoto.js';
import { link } from '../components/link.js';
import { element as e, template } from '../dynamic-dom/index.js';
import { container } from '../components/container.css.js';
const title = template`${link('/', 'LMOliver')}/${link('/blog', 'blog')}`;
const blogHeaderCommon1 = [
	e('header', { class: container }, e('h1', title)),
	e('nav', { class: container },
		e('ul',
			e('li', link('/blog/about', '关于')),
		),
	),
];
const blogHeaderCommon2 = [
	e('aside', { class: `${friends} ${container}`, style: 'text-align:center;' },
		e('h3', '友链'),
		e('ul',
			e('li', e('a', { href: 'https://xyix.github.io' }, 'x义x')),
			e('li', e('a', { href: 'https://dpair2005.github.io' }, 'DPair')),
			e('li', e('a', { href: 'https://coderoj.ml' }, 'Jacder')),
			e('li', e('a', { href: 'https://csgblog.top' }, 'chenkuowen')),
		),
	),
];
export function blogSidebars() {
	return [
		...blogHeaderCommon1,
		...blogHeaderCommon2,
		e('aside', { class: `${hitokotoClass} ${container}`, style: 'text-align:center;' },
			e('h3', '一言'),
			hitokoto(),
		),
	];
}
export const blogTitle = e('title', '博客');