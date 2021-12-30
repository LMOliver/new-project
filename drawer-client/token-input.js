import { element as e, valueBox } from '../dynamic-dom/index.js';
import { computed } from '../dynamic/dynamic.js';

export function tokenSubmitEntryInput() {
	const token = e('input', {
		autocomplete: 'off',
		style: 'width:30em;max-width:calc(100% - 8px);',
		required: true,
		pattern: '^[1-9]\\d{0,7}:[a-zA-Z0-9]{16}$',
	});
	token.addEventListener('input', () => {
		if (token.validity.patternMismatch) {
			token.setCustomValidity('token 应为形如 xxxxx:yyyyyyyyyyyyyyyy 的字符串');
		}
		else {
			token.setCustomValidity('');
		}
	});
	const tokenBox = valueBox(token);
	return {
		element: [
			e('p', { style: 'margin-top:0;' }, e('a', {
				href: 'https://www.luogu.com.cn/paintboard',
				target: '_blank',
				rel: 'noopener',
			}, '洛谷冬日绘板活动页面')),
			e('p', e('label', 'token: ', token)),
		],
		value: computed($ => ({
			token: $(tokenBox),
			remark: $(tokenBox).split(':')[0] + '@Luogu',
		}))
	};
}