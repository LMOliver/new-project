import { JSONRequest } from '../utils/index.js';
import { apiPath } from './apiPath.js';

/**
 * @param {string} uid
 * @returns {Promise<{uid:string;name:string}>}
 */
export function getUser(uid) {
	return JSONRequest(apiPath(`/drawer/user/${uid}`), 'GET');
}