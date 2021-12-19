import { authState, registerOrLoginWithToken, logout, updateState } from '../api/auth.js';
import { loading } from '../components/loading.js';
import { element as e, template as t } from '../dynamic-dom';
import { computed, map, unbox, useBox } from '../dynamic/dynamic.js';
import { tokenInput } from './token-input.js';

function loginPanel() {
	const { element, value } = tokenInput();
	const [hint, set] = useBox(/**@type {import('../dynamic-dom/types.js').Supported}*/([]));
	const [loginPending, setLoginPending] = useBox(false);
	const form = e('form',
		element,
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
								registerOrLoginWithToken(unbox(value)).then(() => []).finally(() => setLoginPending(false)),
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
					slot,
				),
			);
		}
		else {
			return loginPanel();
		}
	});
};