import { makeOnce, weakBind } from '../channel/channel.js';
import { flat, makeBoxDirty, makeSequenceDirty, map, Sequence, SequenceChangeType, unbox, useSequenceDirty } from '../dynamic/dynamic.js';
import { JSONRequest, localStorageHelper } from '../utils/index.js';
import { authState } from './auth.js';

/**
@typedef {{
	owner:string;
	receiver:string;
	status:'invalid'|'busy'|'working'|'unknown';
}} TokenInfo
@typedef {
	{type:'set',statuses:TokenInfo[]}
	|({type:'add'}&TokenInfo)
	|({type:'update'}&TokenInfo)
	|{type:'delete',id:string}
} Message
 */

/**
 * @param {import('./api.js').AuthState} state 
 * @returns {Promise<TokenInfo[]>}
 */
export function getMyTokens(state) {
	if (state.isLoginned) {
		return JSONRequest('/api/drawer/myTokens', 'GET');
	}
	else {
		return Promise.reject('没有登录');
	}
}

const createMyTokensHelper = (/** @type {import("./api.js").AuthState} */ state) => {
	const getter = (/** @type {TokenInfo[]} */ _) => getMyTokens(state);
	const helper = localStorageHelper('my-tokens', getter, []);
	helper.update();
	return helper;
};
const qwqMyTokens = map(authState, createMyTokensHelper);
export const myTokens = flat(map(qwqMyTokens, x => x.box));
export function updateMyTokens() {
	return unbox(qwqMyTokens).update();
}

/**
 * @param {import('./api.js').AuthState} state 
 * @returns {Promise<TokenInfo[]>}
 */
export function getReceivedTokens(state) {
	if (state.isLoginned) {
		return JSONRequest('/api/drawer/tokensForMe', 'GET');
	}
	else {
		return Promise.reject('没有登录');
	}
}

const createReceivedTokens = (/** @type {import("./api.js").AuthState} */ state) => {
	const getter = (/** @type {TokenInfo[]} */ _) => getReceivedTokens(state);
	const helper = localStorageHelper('received-tokens', getter, []);
	helper.update();
	return helper;
};
const qwqReceivedTokens = map(authState, createReceivedTokens);
export const receivedTokens = flat(map(qwqReceivedTokens, x => x.box));
export function updateReceivedTokens() {
	return unbox(qwqReceivedTokens).update();
}

// /**
//  * @returns {Promise<[Sequence<TokenInfo>,Promise<void>,import('../channel/channel.js').Callback<void>]>}
//  */
// export function tokens() {
// 	console.log('tokens() called');
// 	const websocket = new WebSocket(`${location.protocol === 'https' ? 'wss' : 'ws'}:${location.host}/api/drawer/tokens`);
// 	return new Promise((resolve, reject) => {
// 		websocket.addEventListener('close', reject);
// 		websocket.addEventListener('error', reject);
// 		websocket.addEventListener('open', outerListener);
// 		function outerListener() {
// 			websocket.removeEventListener('open', outerListener);
// 			websocket.addEventListener('message', innerListener);
// 			function innerListener(/** @type {{ data: string; }} */ event) {
// 				websocket.removeEventListener('message', innerListener);
// 				try {
// 					/**@type {Message} */
// 					const message = JSON.parse(event.data);
// 					if (message.type !== 'set') {
// 						throw new TypeError('incorrect type');
// 					}
// 					const sequence = new Sequence(message.statuses, makeOnce(callback => {
// 						websocket.addEventListener('message', event => {
// 							/**@type {Message} */
// 							const m = JSON.parse(event.data);
// 							switch (m.type) {
// 								case 'add': {
// 									const { id, uid, status } = m;
// 									callback([
// 										SequenceChangeType.insert,
// 										sequence.current.length,
// 										{ id, uid, status }
// 									]);
// 									break;
// 								}
// 								case 'update': {
// 									const { id, uid, status } = m;
// 									callback([
// 										SequenceChangeType.set,
// 										sequence.current.findIndex(x => x.id === m.id),
// 										{ id, uid, status }
// 									]);
// 									break;
// 								}
// 								case 'delete': {
// 									callback([
// 										SequenceChangeType.delete,
// 										sequence.current.findIndex(x => x.id === m.id),
// 										null
// 									]);
// 									break;
// 								}
// 							}
// 						});
// 						return () => {
// 							websocket.close();
// 						};
// 					}));
// 					resolve([
// 						sequence,
// 						new Promise(resolve => {
// 							websocket.addEventListener('close', () => resolve());
// 						}),
// 						() => websocket.close(),
// 					]);
// 				}
// 				catch (error) {
// 					console.error(error);
// 					websocket.close();
// 				}
// 			}
// 		}
// 	});
// }

/**
 * @param {import('./api.js').PaintToken} a 
 * @param {import('./api.js').PaintToken} b 
 */
export function isTokenEqual(a, b) {
	return a.uid === b.uid && a.clientID === b.clientID;
}

/**
 * @param {import('./api.js').PaintToken} token 
 * @param {string} receiver
 * @returns {Promise<void>}
 */
export async function uploadToken(token, receiver) {
	await JSONRequest('/api/drawer/tokens', 'POST', { token, receiver });
	updateMyTokens();
	updateReceivedTokens();
}