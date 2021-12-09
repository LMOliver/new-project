import { computed } from '../dynamic/computed.js';
import { useBox } from '../dynamic/dynamic.js';
import { fromPromise } from '../dynamic/utils.js';

const DEFAULT_DELAY = 200;

/**
 * @param {Promise<import('../dynamic-dom/types.js').Supported>} promise
 * @param {()=>import('../dynamic-dom/types.js').Supported} pending
 * @param {(reason:any)=>import('../dynamic-dom/types.js').Supported} rejected
 * @param {number} delay
 * @returns {import('../dynamic-dom/types.js').Supported}
 */
export function loading(promise, pending = () => [], rejected = error => error.toString(), delay = DEFAULT_DELAY) {
	const box = fromPromise(promise);
	const [late, setLate] = useBox(delay === 0);
	setTimeout(() => {
		setLate(true);
	}, delay);
	return computed($ => {
		const state = $(box);
		if (state.status === 'resolved') {
			return state.value;
		}
		else if (state.status === 'pending') {
			return $(late) ? pending() : [];
		}
		else {
			return rejected(state.reason);
		}
	});
}