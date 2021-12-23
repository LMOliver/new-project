import { authState, registerOrLoginWithLuogu, logout, updateState } from '../api/auth.js';
import { loading } from '../components/loading.js';
import { element as e, template as t, valueBox } from '../dynamic-dom';
import { computed, useBox } from '../dynamic/dynamic.js';
import { encode } from 'base64-arraybuffer';
import { copyableText } from '../components/copyableText.js';

const LENGTH = 32;
/**
 * @returns {Promise<{slogan:string,secret:string}>}
 */
async function getRandomPair() {
	let array = new Uint8Array(LENGTH);
	crypto.getRandomValues(array);
	const secret = [...array].map(x => x.toString(16).padStart(2, '0')).join('');
	const result = await crypto.subtle.digest('sha-256', new TextEncoder().encode(secret));
	const slogan = '[Drawer/auth]' + encode(result);
	return { slogan, secret };
};

function loginPanel() {
	const uid = e('input', {
		type: 'text',
		style: 'width:4em;',
		required: true,
		pattern: '^[1-9]\\d*$',
		maxlength: 7,
	});
	const uidBox = valueBox(uid);
	const form = e('form',
		e('p', e('label', 'uid: ', uid)),
		computed($ => {
			const uidValue = $(uidBox);
			if (!/^[1-9]\d*$/.test(uidValue)) {
				return e('p',
					{ style: 'margin-block-end:0;' },
					'请输入您的 uid'
				);
			}
			else {
				return loading(
					getRandomPair()
						.then(pair => {
							const [hint, set] = useBox(/**@type {import('../dynamic-dom/types.js').Supported}*/([]));
							const [loginPending, setLoginPending] = useBox(false);
							const submitButton = [
								e('input', {
									type: 'submit',
									disabled: loginPending,
									$click: event => {
										event.preventDefault();
										if (form.reportValidity()) {
											setLoginPending(true);
											set(
												loading(
													registerOrLoginWithLuogu(uidValue, pair.secret)
														.then(() => [])
														.finally(() => setLoginPending(false)),
													() => e('span', { style: 'margin-left:1em;' }, '登录中……'),
													error => e('span',
														{ style: 'color:red;margin-left:1em;' },
														`登录失败：${error.message}`
													),
												)
											);
										}
									},
									value: '登录',
								}),
								hint,
							];

							const a1 = e('a', { href: `https://www.luogu.com.cn/user/${uidValue}` }, '您的个人主页');
							const a2 = e('code', copyableText(pair.slogan));
							return [
								e('p', t`请前往${a1}，将签名改为 ${a2}，然后点击登录。`),
								e('p',
									{ style: 'margin-block-end:0;' },
									submitButton,
								),
							];
						})
				);
			}
		}),
	);
	uid.addEventListener('input', () => {
		if (uid.validity.patternMismatch) {
			uid.setCustomValidity('uid 应是数字');
		}
		else {
			uid.setCustomValidity('');
		}
		form.reportValidity();
	});
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
					e('summary', '您好，', state.name),
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