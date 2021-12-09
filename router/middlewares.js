import { element as e } from '../dynamic-dom/index.js';
/**
 * @typedef {(next:import('./index.js').Handler)=>import('./index.js').Handler} Middleware
 */

/**
 * @param {import('../dynamic-dom/types.js').Supported[]} children
 * @returns {Middleware}
 */
export function prepandInHead(...children) {
	return next => context => {
		const { head, ...rest } = next(context);
		return { head: [...children, head], ...rest };
	};
}