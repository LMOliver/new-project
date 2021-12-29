import { element as e } from '../dynamic-dom/index.js';
import { useBox } from '../dynamic/dynamic.js';
import { loading } from './loading.js';

/**
 * @param {string} text
 */
export function copyableText(text) {
	const span = e('span', { style: 'user-select:all;' }, text);
	if (navigator.clipboard) {
		const [hint, setHint] = useBox(/**@type {import('../dynamic-dom/types.js').Supported}*/('复制'));
		const button = e('button', {
			$click: event => {
				event.preventDefault();
				setHint(loading(
					(async () => {
						try {
							await navigator.clipboard.writeText(text);
							return '成功';
						}
						catch (_) {
							return '失败';
						}
					})(),
					() => '复制',
					() => '',
					0,
				));
			},
			$mouseleave: () => {
				setHint('复制');
			},
		},
			hint
		);
		return e('span',
			button,
			span,
		);
	}
	else {
		return span;
	}
}