import { bindValue } from '../../components/bind.js';
import { container } from '../../components/container.css.js';
import { link } from '../../components/link.js';
import { element as e, template as t } from '../../dynamic-dom/index.js';
import { computed, useBox } from '../../dynamic/dynamic.js';
import defaultSetting from '../../fufa-generator/default-strings.json';
import { produce } from '../../fufa-generator/index.js';
/**
 * @type {import('../../router/index.js').Handler}
 */
export function fufa() {
	const config = e('textarea', { style: 'width:80%;height:20vw;' });
	config.value = JSON.stringify(defaultSetting, null, '\t');
	const box = bindValue(config);
	const [receive, trigger] = useBox('QAQ');
	return {
		head: [
			e('title', '胡话生成器'),
		],
		body: [
			e('article', { class: container },
				e('h2', t`${link('/', 'LMOliver')}/胡话生成器`),
				e('p', '原作：Flamire'),
				e('p', t`${e('a', { href: 'https://xyix.github.io/posts/?postname=moonshine-generator' }, '魔改')}：x义x、Flying2018`),
				e('p', '再次魔改：LMOliver'),
				config,
				e('p', e('button', { $click: () => trigger('QAQ') }, '重新生成胡话')),
				e('p',
					computed($ => {
						$(receive);
						try {
							const strings = JSON.parse($(box));
							return Array.from({ length: 50 }, () => e('div', produce(strings)));
						}
						catch (e) {
							return e.message;
						}
					}),
				)
			)
		],
	};
}