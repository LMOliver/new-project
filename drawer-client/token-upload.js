import { uploadToken } from '../api-client/tokens.js';
import { tokenSubmitEntryInput } from './token-input.js';
import { fileUploader } from '../components/file-uploader.js';
import { loading } from '../components/loading.js';
import { element as e, template, valueBox } from '../dynamic-dom/index.js';
import { map, SequenceChangeType, unbox, useBox, useSequence } from '../dynamic/dynamic.js';

/**
 * @param {any} uid
 */
function singleUploadForm(uid) {
	const { element, value } = tokenSubmitEntryInput();
	const [hint, set] = useBox(/**@type {import('../dynamic-dom/types.js').Supported}*/([]));
	const [isPending, setIsPending] = useBox(false);
	const form = e('form', { style: 'margin-top:0;' },
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
												'提交成功，感谢您的贡献！'
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
 * @param {string} text
 */
function findEntries(text) {
	// matches 'abcd', 'abcd 1', '"abcd"', '"abcd 1"'
	const REGEX = /\b[1-9]\d{0,7}:[a-zA-Z0-9]{16}\b/g;
	const results = text.match(REGEX) || [];
	return results.map(x => ({ token: x }));
}

/**
 * @param {string} uid
 * @param {{token:import('../api-client/api.js').PaintToken}[]} entries 
 * @param {(item:{token:import('../api-client/api.js').PaintToken,message:string})=>void} reportError
 */
function multiUploadingProcess(uid, entries, reportError) {
	const [progress, set] = useBox(0);
	return {
		element: [
			e('progress', {
				min: 0,
				max: entries.length,
				value: progress,
			}),
			e('span', template`${progress}/${entries.length}`),
		],
		promise: (async () => {
			let cnt = 0;
			for (const qwq of entries) {
				for (let tries = 0; tries < 6; tries++) {
					try {
						const { isNewToken } = await uploadToken({ token: qwq.token, receiver: uid });
						if (!isNewToken) {
							throw new Error('该 token 已提交过');
						}
						break;
					}
					catch (error) {
						if (error.message && (error.message.includes('频繁') || error.message.startsWith('5'))) {
							await new Promise(resolve => setTimeout(resolve, 2 ** tries * 1000));
						}
						else {
							reportError({
								token: qwq.token,
								message: error.message || error.toString()
							});
							break;
						}
					}
				}
				set(++cnt);
			}
		})()
	};
}

/**
 * @param {string} uid
 */
function multiUploadForm(uid) {
	const [errors, change] = useSequence(/**@type {{token:string,message:string}[]}*/([]));
	const uploader = fileUploader('上传 token 文件', {
		accept: 'text/plain,application/json'
	}, async file => {
		while (errors.current.length !== 0) {
			change([SequenceChangeType.delete, errors.current.length - 1, null]);
		}
		set('读取中……');
		const entries = findEntries(await file.text());
		const { element, promise } = multiUploadingProcess(uid, entries, item => {
			change([SequenceChangeType.insert, errors.current.length, item]);
		});
		set(element);
		promise.finally(() => {
			set(uploader);
		});
	});
	const [qwq, set] = useBox(uploader);
	return e('p', { style: 'margin-bottom:0;' },
		qwq,
		e('ul',
			map(errors, ({ token, message }) =>
				e('li', `${token} ${message}`)
			),
		),
	);
}

/**
 * @param {string} receiver
 */
export function tokenUploadForm(receiver) {
	const single = singleUploadForm(receiver);
	const multi = multiUploadForm(receiver);
	const select = e('select',
		e('option', { value: 'single', selected: true }, '提交单个 token'),
		e('option', { value: 'multi' }, '上传文件'),
	);
	return [
		select,
		map(valueBox(select), s => s === 'single' ? single : multi),
	];
}