import { uploadToken } from '../api-client/tokens.js';
import { tokenSubmitEntryInput } from '../auth-client/token-input.js';
import { fileUploader } from '../components/file-uploader.js';
import { loading } from '../components/loading.js';
import { element as e, valueBox } from '../dynamic-dom/index.js';
import { map, unbox, useBox } from '../dynamic/dynamic.js';

/**
 * @param {any} uid
 */
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
 * @param {string} text
 */
function findEntries(text) {
	// matches 'abcd', 'abcd 1', '"abcd"', '"abcd 1"'
	const REGEX = /\b(?:[0-9a-f]{40})(?: (?:[1-9]\d{0,7}))?\b/g;
	const results = text.match(REGEX) || [];
	return results.map(x => x.split(' ')).map(x => ({ token: x[0], remark: x[1] || null }));
}

/**
 * @param {string} uid
 * @param {{token:import('../api-client/api.js').PaintToken,remark:string|null}[]} entries 
 */
function multiUploadingProcess(uid, entries) {
	// console.log(uid, entries);
	const [progress, set] = useBox(0);
	return {
		element: e('progress', {
			min: 0,
			max: entries.length,
			value: progress,
		}),
		promise: (async () => {
			let cnt = 0;
			for (const qwq of entries) {
				for (let tries = 0; tries < 4; tries++) {
					try {
						await uploadToken({ token: qwq.token, remark: qwq.remark ? qwq.remark + '@Luogu' : null, receiver: uid });
						break;
					}
					catch (error) {
						// console.error(error);
						if (tries + 1 < 4) {
							await new Promise(resolve => setTimeout(resolve, 2 ** tries * 1000));
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
	const uploader = fileUploader('上传 token 文件', {
		accept: 'text/plain,application/json'
	}, async file => {
		set('读取中……');
		const entries = findEntries(await file.text());
		const { element, promise } = multiUploadingProcess(uid, entries);
		set(element);
		promise.finally(() => {
			set(uploader);
		});
	});
	const [qwq, set] = useBox(uploader);
	return e('p', { style: 'margin-bottom:0;' }, qwq);
}

/**
 * @param {string} uid
 */
export function tokenUploadForm(uid) {
	const single = singleUploadForm(uid);
	const multi = multiUploadForm(uid);
	const select = e('select',
		e('option', { value: 'single', selected: true }, '提交单个 token'),
		e('option', { value: 'multi' }, '上传文件'),
	);
	return [
		select,
		map(valueBox(select), s => s === 'single' ? single : multi),
	];
}

/**
 * @param {import('../dynamic/dynamic.js').Box<import('../api-client/api.js').AuthState>} state 
 */
export function tokenSelfUploadForm(state) {
	return map(state, s => s.isLoginned ? tokenUploadForm(s.uid) : []);
}