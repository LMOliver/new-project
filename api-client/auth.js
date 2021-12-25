import { useStorage } from '../components/storage.js';
import { map } from '../dynamic/dynamic.js';
import { optimizeEqual } from '../dynamic/utils.js';
import { JSONRequest } from '../utils/index.js';
import { apiPath } from './apiPath.js';

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
 * @param {string} uid
 * @param {string} secret
 */
export async function registerOrLoginWithLuogu(uid, secret) {
	/**@type {{uid:string,name:string}}*/
	const result = await JSONRequest(apiPath('/drawer/auth'), 'POST', { type: 'Luogu', uid, secret });
	setAuthState({ isLoginned: true, uid: result.uid, name: result.name });
}
export async function logout() {
	/* no await */JSONRequest(apiPath('/drawer/auth'), 'DELETE');
	setAuthState({ isLoginned: false });
}
/**
 * @returns {Promise<import('./api.js').AuthState>}
 */
export async function fetchState() {
	/**@type {{uid:string,name:string}|null} */
	const result = await JSONRequest(apiPath('/drawer/auth'), 'GET');
	return result === null ? { isLoginned: false } : { isLoginned: true, uid: result.uid, name: result.name };
}
export async function updateState() {
	setAuthState(await fetchState());
}