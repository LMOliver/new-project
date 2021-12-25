import { authState } from '../api-client/auth.js';
import { receivedTokens, updateReceivedTokens } from '../api-client/tokens.js';
import { authClient } from '../auth-client/index.js';
import { container, globalContainer } from '../components/container.css.js';
import { link } from '../components/link.js';
import { element as e } from '../dynamic-dom/index.js';
import { computed } from '../dynamic/dynamic.js';
import { taskList } from './task-list.js';
import { taskUploader } from './task-upload.js';
import { tokenList } from './token-list.js';
import { tokenSelfUploadForm } from './token-upload.js';

function authPart() {
	return e('div', { class: container },
		e('h3', '用户'),
		authClient(),
	);
}

function tokenPart() {
	return e('div', { class: container },
		e('h3', 'Token'),
		e('details',
			e('summary', 'token 列表'),
			tokenList(receivedTokens, updateReceivedTokens),
		),
		e('details',
			e('summary', '提交 token'),
			tokenSelfUploadForm(authState),
		),
	);
}

/**@type {import('../router').Handler} */
export function collectorClient(context) {
	return {
		head: [
			e('title', '绘板'),
		],
		body: [
			e('article', { class: globalContainer },
				e('h1', link('/', 'LMOliver'), '/绘板'),
				authPart(),
				computed($ => {
					const state = $(authState);
					if (state.isLoginned) {
						return [
							tokenPart(),
							e('div', { class: container },
								e('h3', '任务'),
								taskList(),
								e('details',
									e('summary', '新增任务'),
									taskUploader()
								)
							),
						];
					}
					else {
						return [];
					}
				})
			)
		],
	};
}
