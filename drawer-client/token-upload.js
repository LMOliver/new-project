import { empty } from '../channel/channel.js';
import { fileUploader } from '../components/file-uploader.js';
import { element as e, template as t, text, valueBox } from '../dynamic-dom/index.js';
import { computed, flat, makeSequenceDirty, map, SequenceChangeType, useSequence } from '../dynamic/dynamic.js';
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

export function tokenUploadForm() {
	const select = e('select',
		e('option', { value: 'single', selected: true }, '上传单个 token'),
		e('option', { value: 'multiple' }, '上传多个 token'),
	);
	return e('form',
		select,
		computed($ => {
			return String($(valueBox(select)));
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