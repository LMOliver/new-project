import { flat, map, unbox } from '../dynamic/dynamic.js';
import { JSONRequest, localStorageHelper } from '../utils/index.js';
import { apiPath } from './apiPath.js';
import { authState } from './auth.js';

/**
@typedef {{
	status:'invalid'|'busy'|'working'|'waiting';
	remark:string|null;
}} TokenInfo

/**
 * @param {import('./api.js').AuthState} state 
 * @returns {Promise<TokenInfo[]>}
 */
export function getReceivedTokens(state) {
	if (state.isLoginned) {
		return JSONRequest(apiPath('/drawer/tokens'), 'GET');
	}
	else {
		return Promise.reject('没有登录');
	}
}

const createReceivedTokens = (/** @type {import("./api.js").AuthState} */ state) => {
	const getter = (/** @type {TokenInfo[]} */ _) => getReceivedTokens(state);
	const helper = localStorageHelper('received-tokens', getter, []);
	return helper;
};
const qwqReceivedTokens = map(authState, createReceivedTokens);
export const receivedTokens = flat(map(qwqReceivedTokens, x => x.box));
export function updateReceivedTokens() {
	return unbox(qwqReceivedTokens).update();
}

/**
 * @param {{token:import('./api.js').PaintToken,receiver:string}} token 
 * @returns {Promise<{isNewToken:boolean}>}
 */
export async function uploadToken({ token, receiver }) {
	const result = await JSONRequest(apiPath('/drawer/tokens'), 'POST', { token, receiver });
	/** no await */updateReceivedTokens()
		.then(() => {
			if (unbox(receivedTokens).some(x => x.status === 'waiting')) {
				setTimeout(() => {
					updateReceivedTokens();
				}, 2000);
			}
		});
	return result;
}

/**
 * @param {string[]} uids
 * @returns {Promise<({ok:true,token:string}|{ok:false,reason:string})[]>}
 */
export async function deleteTokens(uids) {
	const result = await JSONRequest(apiPath('/drawer/tokens'), 'DELETE', uids);
	/** no await */updateReceivedTokens();
	return result;
}