import { element as e, valueBox } from '../dynamic-dom/index.js';
import { computed } from '../dynamic/dynamic.js';

export function tokenSubmitEntryInput() {
	const token = e('input', {
		autocomplete: 'off',
		// type: 'password',
		style: 'width:30em;max-width:calc(100% - 8px);',
		required: true,
		// pattern: '^[0-9a-f]{40}$',
	});
	// token.addEventListener('input', () => {
	// 	if (token.validity.patternMismatch) {
	// 		token.setCustomValidity('token 应是长度为 40 的十六进制串');
	// 	}
	// 	else {
	// 		token.setCustomValidity('');
	// 	}
	// });
	const uid = e('input', {
		type: 'text',
		style: 'width:10em;',
		pattern: '^|[1-9]\\d*$',
		placeholder: '仅用于备注，可不填写',
		maxlength: 7,
	});
	uid.addEventListener('input', () => {
		if (uid.validity.patternMismatch) {
			uid.setCustomValidity('uid 应是数字');
		}
		else {
			uid.setCustomValidity('');
		}
	});
	const tokenBox = valueBox(token);
	const uidBox = valueBox(uid);
	return {
		element: [
			e('p', { style: 'margin-top:0;' }, e('a', {
				href: 'https://www.luogu.com.cn/paintboard',
				target: '_blank',
				rel: 'noopener',
			}, '洛谷冬日绘板活动页面')),
			e('p', e('label', 'token: ', token)),
			e('p', e('label', 'uid: ', uid)),
		],
		value: computed($ => ({
			token: $(tokenBox),
			remark: $(uidBox) ? $(uidBox) + '@Luogu' : null,
		}))
	};
}