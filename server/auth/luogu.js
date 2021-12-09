import fetch from 'node-fetch';
import { UserInputError } from '../../ensure/index.js';
import { sloganLogin } from './slogan-login.js';
/**
 * @typedef {{slogan:string}} User
 * @typedef {{errorMessage:string}} LuoguError
 */

/**
 * @param {string} uid 
 * @returns {Promise<User>}
 */
async function getUser(uid) {
	return fetch(`https://www.luogu.com.cn/user/${uid}?_contentOnly=1`)
		.then(x =>/**@type {Promise<{currentData:{user:User}|LuoguError}>} */(x.json()))
		.then(x => x.currentData)
		.then(x => {
			if ('user' in x) {
				return x.user;
			}
			throw Object.assign(new Error(x.errorMessage), { uid });
		});
}
/**
 * @param {string} uid
 * @returns {Promise<string>}
 */
async function getSlogan(uid) {
	const x = await getUser(uid);
	return x.slogan;
}

export function luoguLogin() {
	return sloganLogin('luogu', /^[1-9]\d{0,7}$/, async uid => {
		try {
			return await getSlogan(uid);
		}
		catch (error) {
			if (error.message === '用户未找到') {
				throw new UserInputError(`uid 为 ${error.uid} 的用户不存在`);
			}
			else {
				throw error;
			}
		}
	});
}