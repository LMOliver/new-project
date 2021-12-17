import { authState, registerOrLoginWithToken, logout, updateState } from '../api/auth.js';
import { loading } from '../components/loading.js';
import { useStorage } from '../components/storage.js';
import { element as e, template as t } from '../dynamic-dom';
import { computed, map, useBox } from '../dynamic/dynamic.js';
import { JSONRequest } from '../utils';

function loginPanel() {
	const uid = e('input', {
		id: 'uid',
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
	const clientId = e('input', {
		id: 'client-id',
		type: 'password',
		style: 'width:30em;max-width:calc(100% - 8px);',
		required: true,
		pattern: '^[0-9a-z]{40}$',
		autocomplete: 'off',
	});
	clientId.addEventListener('input', () => {
		if (clientId.validity.patternMismatch) {
			clientId.setCustomValidity('__client_id 应是长度为 40 的十六进制串');
		}
		else {
			clientId.setCustomValidity('');
		}
	});
	const [hint, set] = useBox(/**@type {import('../dynamic-dom/types.js').Supported}*/([]));
	const [loginPending, setLoginPending] = useBox(false);
	const form = e('form',
		e('p', e('label', { for: 'uid' }, '_uid: '), uid),
		e('p', e('label', { for: 'client-id' }, '__client_id: '), clientId),
		e('p',
			{ style: 'margin-block-end:0;' },
			e('input', {
				type: 'submit',
				disabled: loginPending,
				$click: event => {
					event.preventDefault();
					if (form.reportValidity()) {
						setLoginPending(true);
						set(
							loading(
								registerOrLoginWithToken({
									uid: uid.value,
									clientID: clientId.value,
								}).then(() => []).finally(() => setLoginPending(false)),
								() => e('span', { style: 'margin-left:1em;' }, '提交中……'),
								error => e('span', { style: 'color:red;margin-left:1em;' }, `提交失败：${error.message}`),
							)
						);
					}
					else {

					}
				},
				value: '提交',
			}),
			hint,
		),
	);
	return form;
}

/**
 * @param {import('../dynamic-dom/types.js').Supported} slot 
 */
export function authClient(slot = []) {
	updateState().catch(() => { });
	return computed($ => {
		const state = $(authState);
		if (state.isLoginned) {
			const [hint, set] = useBox(/**@type {import('../dynamic-dom/types.js').Supported}*/([]));
			const [logoutPending, setLogoutPending] = useBox(false);
			return e('p',
				e('details',
					e('summary', '您好，', state.uid),
					e('p',
						e('button', {
							disabled: logoutPending,
							$click: () => {
								setLogoutPending(true);
								set(
									loading(
										logout().then(() => []).finally(() => setLogoutPending(false)),
										() => e('span', '登出中……'),
										error => e('span', { style: 'color:red;' }, `登出失败：${error.message}`)
									)
								);
							}
						}, '登出'),
						hint,
					),
					slot,
				),
			);
		}
		else {
			return loginPanel();
		}
	});
};