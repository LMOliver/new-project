/**@typedef {{isLoginned:true,uid:string}|{isLoginned:false}} */

import { useStorage } from '../components/storage.js';
import { map } from '../dynamic/dynamic.js';
import { optimizeEqual } from '../dynamic/utils.js';
import { JSONRequest } from '../utils/index.js';

const [box, set] = useStorage(localStorage, 'auth');

/**
 * @type {import('../dynamic/dynamic.js').Box<import('./api.js').AuthState>}
 */
export const authState = map(optimizeEqual(box), value => {
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
 * @param {import('./api.js').AuthState} state 
 */
function setAuthState(state) {
	set(JSON.stringify(state));
}

/**
 * @param {import('./api.js').PaintToken} token
 */
export async function registerOrLoginWithToken(token) {
	/**@type {{uid:string}}*/
	const result = await JSONRequest('/api/auth/token', 'POST', { type: 'luogu-paint-token', token});
	setAuthState({ isLoginned: true, uid: result.uid });
}
export async function logout() {
	await JSONRequest('/api/auth/logout', 'POST');
	setAuthState({ isLoginned: false });
}
/**
 * @returns {Promise<import('./api.js').AuthState>}
 */
export async function fetchState() {
	/**@type {{uid:string}|null} */
	const result = await JSONRequest('/api/auth/state', 'GET');
	return result === null ? { isLoginned: false } : { isLoginned: true, uid: result.uid };
}
export async function updateState() {
	setAuthState(await fetchState());
}