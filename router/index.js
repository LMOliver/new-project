/**
@typedef {{
	path:import('../dynamic').Box<{
		routing:import('../components/path.js').Path;
		original:import('../components/path.js').Path;
		search:URLSearchParams;
	}>;
	fallback:Handler
}} Context
@typedef {{
	head:import('../dynamic-dom/types.js').Supported;
	body:import('../dynamic-dom/types.js').Supported;
}} Application
 * @typedef {(context:Context)=>Application} Handler
 */

import { computed, useBox } from '../dynamic';

/**
 * @param {string} prefix 
 * @param {string} value 
 * @returns {{matched:true,prefix:string}|{matched:false}}
 */
function matchAttempt(prefix, value) {
	if (value === '/') {
		value = '';
	}
	if (prefix.endsWith('/')) {
		return prefix.slice(0, -1) === value ? { matched: true, prefix: value } : { matched: false };
	}
	else {
		return value.startsWith(prefix) ? { matched: true, prefix } : { matched: false };
	}
}
/**
 * @param {[prefix:string,handler:Handler][]} routes 
 * @returns {Handler}
 */
export function router(routes) {
	return context => {
		/**
		@type {{
			index:number;
			instance:Application;
			setPath:import('../channel/channel.js').Callback<Context['path']['current'][0]>;
		}|null}
		 */
		let cached = null;
		/**
		 * @param {string} path
		 * @param {Handler} fallback
		 * @returns {[index:number,prefix:string,handler:Handler]}
		 */
		function matchPrefix(path, fallback) {
			for (let index = 0; index < routes.length; index++) {
				const [prefix, handler] = routes[index];
				const result = matchAttempt(prefix, path);
				if (result.matched) {
					return [index, result.prefix, handler];
				}
			}
			return [-1, '', fallback];
		}
		/**@type {import('../dynamic').Box<Application>} */
		const box = computed($ => {
			const { routing, original, search } = $(context.path);
			const [index, prefix, handler] = matchPrefix(routing, context.fallback);
			/**@type {Context['path']['current'][0]} */
			const newPath = {
				routing: routing.slice(prefix.length),
				original: original,
				search,
			};
			if (cached === null || cached.index !== index) {
				const [path, setPath] = useBox(newPath);
				cached = {
					index,
					instance: handler({
						path,
						fallback: context.fallback,
					}),
					setPath,
				};
				return cached.instance;
			}
			else {
				cached.setPath(newPath);
				return cached.instance;
			}
		});
		return {
			head: computed($ => $(box).head),
			body: computed($ => $(box).body),
		};
	};
}