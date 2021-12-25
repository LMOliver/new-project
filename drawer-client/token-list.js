import { container } from '../components/container.css.js';
import { loading } from '../components/loading.js';
import { element as e, template as t } from '../dynamic-dom/index.js';
import { map, useBox } from '../dynamic/dynamic.js';
import { showTokenStatus } from './showTokenStatus.js';
import { showSmallUID } from './showUID.js';

/**
 * @param {import('../api-client/tokens.js').TokenInfo[]} list 
 * @param {number} startIndex
 */
function showListPart(list, startIndex) {
	return e('table', { class: container, style: 'height:fit-content;' },
		e('thead',
			e('tr',
				e('th', { style: 'width:2em;' }, '#'),
				e('th', { style: 'width:2em;' }, '状态'),
				e('th', { style: 'width:3em;' }, 'uid'),
			),
		),
		e('tbody',
			list.map((x, id) =>
				e('tr',
					e('td', startIndex + id),
					// e('td', { style: 'padding:0;' }, showUID(type !== 'owner' ? x.owner : x.receiver)),
					e('td', showTokenStatus(x.status)),
					e('td', x.remark ? showSmallUID(x.remark) : []),
				),
			)
		)
	);
}

const TOKENS_PER_PART = 10;
/**
 * @param {import('../api-client/tokens.js').TokenInfo[]} list 
 */
function showList(list) {
	if (list.length === 0) {
		return e('div', { class: container, style: 'width:fit-content;' }, '没有 token');
	}
	return e('div', { style: 'display:flex;flex-wrap:wrap;gap:0.5em;' },
		Array.from(
			{ length: Math.ceil(list.length / TOKENS_PER_PART) },
			(_, i) => list.slice(i * TOKENS_PER_PART, (i + 1) * TOKENS_PER_PART)
		).map((part, i) => showListPart(part, i * 10 + 1))
	);
}

/**
 * @param {typeof import("../api-client/tokens.js").receivedTokens} tokenInfoList
 * @param {typeof import("../api-client/tokens.js").updateReceivedTokens} update
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
	const [hint, setHint] = useBox(/**@type {import('../dynamic-dom/types.js').Supported}*/(fetchAndUpdate()));
	return [
		e('p',
			t`${map(tokenInfoList, list => list.filter(x => x.status === 'working' || x.status === 'waiting').length)} 个有效 token`,
			e('button', {
				disabled: isLoading,
				$click: () => setHint(fetchAndUpdate()),
			}, '刷新'),
			hint,
		),
		map(tokenInfoList, list => showList(list)),
	];
}