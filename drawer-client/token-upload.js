import { uploadToken } from '../api/tokens.js';
import { tokenInput } from '../auth-client/token-input.js';
import { empty } from '../channel/channel.js';
import { fileUploader } from '../components/file-uploader.js';
import { loading } from '../components/loading.js';
import { element as e, template as t, text, valueBox } from '../dynamic-dom/index.js';
import { computed, flat, makeSequenceDirty, map, SequenceChangeType, unbox, useBox, useSequence } from '../dynamic/dynamic.js';
import { wrap } from '../dynamic/utils.js';

/**
 * @param {string} text 
 * @returns {Generator<import('../api/api.js').PaintToken>}
 */
function* findTokens(text) {
	const TOKEN_REGEX = /_uid=(?<uid>[0-9]\d*);__client_id=(?<clientID>[0-9a-z]{40})/g;
	while (true) {
		const match = TOKEN_REGEX.exec(text);
		if (match === null || !match.groups) {
			return;
		}
		else {
			yield { uid: match.groups.uid, clientID: match.groups.clientID };
		}
	}
}

/**
 * @param {import('../dynamic/dynamic.js').Box<import('../api/api.js').AuthState>} state 
 */
function singleUploadForm(state) {
	const { element, value } = tokenInput();
	const receiver = e('input', {
		type: 'text',
		style: 'width:4em;',
		required: map(state, x => !x.isLoginned),
		placeholder: map(state, x => x.isLoginned ? x.uid.split('@')[0] : '必填'),
		pattern: '^[1-9]\\d*$',
	});
	const box = valueBox(receiver);
	const receiverBox = computed($ => {
		const s = $(state);
		const b = $(box);
		if (s.isLoginned) {
			return b ? b + '@Luogu' : s.uid;
		}
		else {
			return b + '@Luogu';
		}
	});
	const [hint, set] = useBox(/**@type {import('../dynamic-dom/types.js').Supported}*/([]));
	const [isPending, setIsPending] = useBox(false);
	const form = e('form',
		element,
		e('label', '贡献给 ', receiver),
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
								uploadToken(unbox(value), unbox(receiverBox))
									.then(() => {
										form.reset();
										return e('span', { style: 'color:green;margin-left:1em' }, '提交成功！');
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
	const select = e('select',
		e('option', { value: 'single', selected: true }, '上传单个 token'),
		e('option', { value: 'multiple' }, '上传多个 token'),
	);
	const box = valueBox(select);
	const singleUploader = singleUploadForm(state);
	return e('form',
		select,
		computed($ => {
			switch ($(box)) {
				case 'single': {
					return singleUploader;
				}
				case 'multiple': {
					return e('em', 'TODO');
				}
				default: {
					return [];
				}
			}
		}),
	);
}

export function tokenUploader() {
	const [list, change] = useSequence(/**@type {{name:string;text:string}[]}*/([]));
	const tokensWithFileName = map(list, ({ name, text }) => ({ name, tokens: [...findTokens(text)] }));
	const allTokens = flat(map(tokensWithFileName, x => makeSequenceDirty(x.tokens, empty)));
	const distinctTokenCount = map(wrap(allTokens), tokens => new Set(tokens.map(x => x.uid)).size);
	return [
		e('ul',
			map(tokensWithFileName,
				({ name, tokens }) =>
					e('li', t`${name} ${tokens.length} token${tokens.length !== 1 ? 's' : ''}`),
			),
		),
		fileUploader('导入 token 文件', { accept: 'application/json,text/plain,.csv' }, async file => {
			change([SequenceChangeType.insert, list.current.length, { name: file.name, text: await file.text() }]);
		}),
		e('p',
			e('input', {
				type: 'submit',
				disabled: map(distinctTokenCount, count => count === 0),
				value: computed($ => `提交 ${$(distinctTokenCount)} 个 token`),
			}),
		),
	];
}