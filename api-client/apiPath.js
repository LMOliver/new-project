const httpAPIRoot = location.origin + '/api';
/**
 * @param {string} path
 */
export function apiPath(path) {
	return httpAPIRoot + path;
}
