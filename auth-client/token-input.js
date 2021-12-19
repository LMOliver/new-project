import { element as e, valueBox } from '../dynamic-dom/index.js';
import { computed } from '../dynamic/dynamic.js';

export function tokenInput({ autoComplete = true } = {}) {
	const uid = e('input', {
		type: 'text',
		style: 'width:4em;',
		required: true,
		pattern: '^[1-9]\\d*$',
	});
	uid.addEventListener('input', () => {
		if (uid.validity.patternMismatch) {
			uid.setCustomValidity('_uid 应是数字');
		}
		else {
			uid.setCustomValidity('');
		}
	});
	const clientID = e('input', {
		autocomplete: 'off',
		type: 'password',
		style: 'width:30em;max-width:calc(100% - 8px);',
		required: true,
		pattern: '^[0-9a-z]{40}$',
	});
	clientID.addEventListener('input', () => {
		if (clientID.validity.patternMismatch) {
			clientID.setCustomValidity('__client_id 应是长度为 40 的十六进制串');
		}
		else {
			clientID.setCustomValidity('');
		}
	});
	const uidBox = valueBox(uid);
	const clientIDBox = valueBox(clientID);
	return {
		element: [
			e('p', e('label', '_uid: ', uid)),
			e('p', e('label', '__client_id: ', clientID)),
		],
		value: computed($ => ({
			uid: $(uidBox),
			clientID: $(clientIDBox),
		}))
	};
}