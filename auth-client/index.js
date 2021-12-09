import { loading } from '../components/loading.js';
import { useStorage } from '../components/storage.js';
import { element as e } from '../dynamic-dom';
import { computed, map, useBox } from '../dynamic/dynamic.js';
import { JSONRequest } from '../utils';

/**@typedef {{isLoginned:true,uid:string}|{isLoginned:false}} AuthState*/

const [box, set] = useStorage(localStorage, 'auth');

/**
 * @type {import('../dynamic/dynamic.js').Box<AuthState>}
 */
export const authState = map(box, value => {
	try {
		if (value === null) {
			throw new Error('auth information not found');
		}
		return JSON.parse(value);
	}
	catch (e) {
		return { loginned: false };
	}
});

/**
 * @param {AuthState} state 
 */
function setAuthState(state) {
	set(JSON.stringify(state));
}

/**
 * @param {{uid:string,clientID:string}} param0 
 */
async function login({ uid, clientID }) {
	/**@type {{uid:string}}*/
	const result = await JSONRequest('/api/auth/login', 'POST', { type: 'luogu-token', uid, clientID });
	setAuthState({ isLoginned: true, uid: result.uid });
}
async function logout() {
	await JSONRequest('/api/auth/logout', 'POST', { type: 'luogu-token' });
	setAuthState({ isLoginned: false });
}

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
		validationMessage: 'qaq',
		pattern: '^[0-9a-z]{40}$',
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
			e('input', {
				type: 'submit',
				disabled: loginPending,
				$click: event => {
					event.preventDefault();
					if (form.reportValidity()) {
						setLoginPending(true);
						set(
							loading(
								login({
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

export function authClient() {
	return computed($ => {
		const state = $(authState);
		if (state.isLoginned) {
			const [hint, set] = useBox(/**@type {import('../dynamic-dom/types.js').Supported}*/([]));
			const [logoutPending, setLogoutPending] = useBox(false);
			return ['uid=', state.uid, map(logoutPending, v => !v ? e('button', {
				$click: () => {
					setLogoutPending(true);
					set(
						loading(
							logout().then(() => []).finally(() => setLogoutPending(false)),
							() => e('p', '登出中……'),
							error => e('p', { style: 'color:red;' }, `登出失败：${error.message}`)
						)
					);
				}
			}, '登出') : []), hint];
		}
		else {
			return loginPanel();
		}
	});
};