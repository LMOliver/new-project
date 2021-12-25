import { element as e } from '../dynamic-dom/index.js';
import { map, useBox } from '../dynamic/dynamic.js';

/**
 * @param {import('../dynamic-dom/types.js').Supported} slot
 * @param {(event:MouseEvent)=>void} onClick
 */
export function confirmButton(slot, onClick) {
	const [isRunning, set] = useBox(false);
	const warning = e('button', {
		$click: e => {
			onClick(e);
			set(false);
		},
		$mouseout: () => {
			set(false);
		},
	},
		e('span', {
			style: 'color:red;'
		}, '确认'),
	);
	return map(isRunning, x => x
		? warning
		: e('button', { $click: () => { set(true); } }, slot)
	);
}