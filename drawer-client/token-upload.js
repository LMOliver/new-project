import { uploadToken } from '../api/tokens.js';
import { tokenSubmitEntryInput } from '../auth-client/token-input.js';
import { loading } from '../components/loading.js';
import { element as e } from '../dynamic-dom/index.js';
import { map, unbox, useBox } from '../dynamic/dynamic.js';

function singleUploadForm(uid) {
	const { element, value } = tokenSubmitEntryInput();
	const [hint, set] = useBox(/**@type {import('../dynamic-dom/types.js').Supported}*/([]));
	const [isPending, setIsPending] = useBox(false);
	const form = e('form',
		element,
		e('p',
			{ style: 'margin-block-end:0;' },
			e('input', {
				type: 'submit',
				disabled: isPending,
				$click: event => {
					event.preventDefault();
					if (form.reportValidity()) {
						setIsPending(true);
						set(
							loading(
								uploadToken({ ...unbox(value), receiver: uid })
									.then(({ isNewToken }) => {
										form.reset();
										return isNewToken
											? e('span', { style: 'color:green;margin-left:1em' },
												'提交成功！'
											)
											: e('span', { style: 'color:orange;margin-left:1em' },
												'该 token 已提交过'
											);
									})
									.finally(() => setIsPending(false)),
								() => e('span', { style: 'margin-left:1em;' }, '提交中……'),
								error => e('span', { style: 'color:red;margin-left:1em;' }, `提交失败：${error.message}`),
							)
						);
					}
				},
				value: '提交',
			}),
			hint,
		),
	);
	return form;
}

/**
 * @param {import('../dynamic/dynamic.js').Box<import('../api/api.js').AuthState>} state 
 */
export function tokenUploadForm(state) {
	return map(state, s => s.isLoginned ? singleUploadForm(s.uid) : []);
}