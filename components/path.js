import { useBox } from '../dynamic/dynamic';

/**
 * @typedef {string} Path
 */
const [path, setPath] =
	useBox(/**@type {Path} */(window.location.pathname));
window.addEventListener('popstate', _event => {
	setPath(window.location.pathname);
});
export {
	path,
};
/**
 * @param {Path} path
 */
export function pushHistory(path) {
	window.history.pushState(undefined, '', path);
	setPath(window.location.pathname);
}
/**
 * @param {Path} path
 */
export function replaceHistory(path) {
	window.history.replaceState(undefined, '', path);
	setPath(window.location.pathname);
}