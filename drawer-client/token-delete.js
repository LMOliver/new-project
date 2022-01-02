import { deleteTokens } from '../api-client/tokens.js';
import { element as e } from '../dynamic-dom/index.js';
import { useBox } from '../dynamic/dynamic.js';

/**
 * @param {string} text
 */
function getUIDs(text) {
	return Array.from(text.match(/\b\d{1,8}\b/g) || []).map(x => x + '@Luogu');
}

export function tokenDeleteUI() {
	const textarea = e('textarea', {
		placeholder: '输入您要删除的 token 的 uid，一行一个'
	});
	const [isPending, set] = useBox(false);
	const [error, setError] = useBox('');
	return e('div',
		textarea,
		e('p',
			e('button', {
				disabled: isPending,
				$click: () => {
					set(true);
					const uids = getUIDs(textarea.value);
					deleteTokens(uids)
						.then(result => {
							textarea.value = result.map((r, i) => r.ok ? r.token : uids[i] + ' ' + r.reason).join('\n');
							setError('');
							setTimeout(() => {
								set(false);
							}, 5 * 1000);
						})
						.catch(error => {
							setError(error.message || error.toString());
							set(false);
						});
				}
			}, '删除'),
			e('span', { style: 'color:red;margin-left:0.5em;' }, error),
		)
	);
}