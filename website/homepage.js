import { element as e, template as t } from '../dynamic-dom';
import { link } from '../components/link.js';
import { hitokoto } from '../components/hitokoto.js';
import { container } from '../components/container.css.js';
// @ts-ignore
import copying from '../COPYING?raw';
// @ts-ignore
import mdItLicense from 'markdown-it/LICENSE?raw';
// @ts-ignore
import katexLicense from 'katex/LICENSE?raw';
// @ts-ignore
import mdItKatexLicense from '@iktakahiro/markdown-it-katex/LICENSE?raw';
// @ts-ignore
import imageQLicense from '../node_modules/image-q/LICENSE?raw';
// @ts-ignore
import cryptoJSLicense from 'crypto-js/LICENSE?raw';
/**
 * @typedef {import('../dynamic-dom/types.js').Supported} Supported
 */

/**
 * @type {import('../router/index.js').Handler}
 */
export function homepage({ path }) {
	const startTime = new Date(2021, 11 - 1, 8).getTime();
	return {
		head: [
			e('title', 'LMOliver'),
		],
		body: [
			e('h1', 'LMOliver'),
			e('ul',
				e('li', link('./blog', 'OI 碎片')),
				e('li', link('./fufa', '胡话生成器')),
				e('li', link('./drawer', '绘板')),
				// e('li', link('./mosiyuan', t`膜拜 ${blackRed('Siyuan')}`)),
			),
			e('p', `这个网站的第一行代码是 LMOliver 于 ${Math.floor((Date.now() - startTime) / 86400 / 1000)} 天前写下的。`),
			e('p', { class: container, style: 'width:300px;' },
				hitokoto(),
			),
			e('details',
				e('summary', '本站使用的库'),
				e('ul',
					e('li', e('a', { href: 'https://www.npmjs.com/package/markdown-it' }, 'markdown-it'), '，', 'MIT License'),
					e('pre', mdItLicense),
					e('li', e('a', { href: 'https://www.npmjs.com/package/katex' }, 'katex'), '，', 'MIT License'),
					e('pre', katexLicense),
					e('li', e('a', { href: 'https://www.npmjs.com/package/@iktakahiro/markdown-it-katex' }, '@iktakahiro/markdown-it-katex'), '，', 'MIT License'),
					e('pre', mdItKatexLicense),
					e('li', e('a', { href: 'https://www.npmjs.com/package/image-q' }, 'image-q'), '，', 'MIT License'),
					e('pre', imageQLicense),
					e('li', e('a', { href: 'https://www.npmjs.com/package/crypto-js' }, 'crypto-js'), '，', 'MIT License'),
					e('pre', cryptoJSLicense),
				),
			),
			e('details',
				e('summary', '版权声明'),
				e('pre', copying)
			),
			e('a', { href: 'https://github.com/LMOliver/new-project' }, '本站源代码'),
		],
	};
}