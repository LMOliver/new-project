import { container } from '../components/container.css.js';
import { loading } from '../components/loading.js';
import { element as e, template as t } from '../dynamic-dom/index.js';
import { map, useBox } from '../dynamic/dynamic.js';
import { showTokenStatus } from './showTokenStatus.js';
import { showUID } from './showUID.js';

/**
 * @param {'owner'|'receiver'} type
 * @param {import('../api/tokens.js').TokenInfo[]} list 
 */
function showList(type, list) {
	if (list.length === 0) {
		return e('div', { class: container, style: 'width:fit-content;' }, '没有 token');
	}
	return e('table', { class: container },
		e('thead',
			e('tr',
				e('th', { style: 'padding:0;' }, type !== 'owner' ? '用户' : '贡献给'),
				e('th', { style: 'width:4em;' }, '状态'),
			),
		),
		e('tbody',
			list.map(x =>
				e('tr',
					e('td', { style: 'padding:0;' }, showUID(type !== 'owner' ? x.owner : x.receiver)),
					e('td', showTokenStatus(x.status)),
				),
			)
		)
	);
}

/**
 * @param {'owner'|'receiver'} type
 * @param {typeof import("../api/tokens.js").myTokens} tokenInfoList
 * @param {typeof import("../api/tokens.js").updateMyTokens} update
 */
export function tokenList(type, tokenInfoList, update) {
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
		e('p',
			t`${map(tokenInfoList, list => list.filter(x => x.status === 'working' || x.status === 'waiting').length)} 个有效 token`,
			e('button', {
				disabled: isLoading,
				$click: () => setHint(fetchAndUpdate()),
			}, '刷新'),
			hint,
		),
		map(tokenInfoList, list => showList(type, list)),
	];
}