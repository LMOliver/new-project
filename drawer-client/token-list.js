import { container } from '../components/container.css.js';
import { loading } from '../components/loading.js';
import { element as e } from '../dynamic-dom/index.js';
import { map, useBox } from '../dynamic/dynamic.js';
import { optimizeEqual } from '../dynamic/utils.js';
import { showUID } from './showUID.js';

/**
 * @param {import('../api/tokens.js').TokenInfo[]} list 
 */
function showList(list) {
	return e('table', { class: container },
		e('thead',
			e('tr',
				e('th', { style: 'width:4em;' }, '用户'),
				e('th', { style: 'width:4em;' }, '贡献给'),
				e('th', { style: 'width:4em;' }, '状态'),
			),
		),
		e('tbody',
			list.map(x =>
				e('tr',
					x.owner === x.receiver
						? e('td', { colspan: 2 }, showUID(x.owner))
						: [
							e('td', showUID(x.owner)),
							e('td', showUID(x.receiver)),
						],
					e('td', {
						style: `color:${{
							unknown: 'black',
							invalid: 'red',
							busy: 'orange',
							working: 'green',
						}[x.status]};`
					},
						x.status,
					)
				),
			)
		)
	);
}

/**
 * @param {typeof import("../api/tokens.js").myTokens} tokenInfoList
 * @param {typeof import("../api/tokens.js").updateMyTokens} update
 */
export function tokenList(tokenInfoList, update) {
	const [isLoading, set] = useBox(false);
	function fetchAndUpdate() {
		set(true);
		return loading(
			update()
				.then(() => {
					return [];
				})
				.finally(() => {
					set(false);
				}),
			() => '加载中……',
			error => e('span', { style: 'color:red;' }, error.message || error.toString())
		);
	}
	const [hint, setHint] = useBox(/**@type {import('../dynamic-dom/types.js').Supported}*/([]));
	return [
		map(tokenInfoList, showList),
		e('p',
			e('button', {
				disabled: isLoading,
				$click: () => setHint(fetchAndUpdate()),
			}, '刷新'),
			hint,
		),
	];
}