import { authState } from '../api/auth.js';
import { myTokens, receivedTokens, updateReceivedTokens } from '../api/tokens.js';
import { authClient } from '../auth-client/index.js';
import { container, globalContainer } from '../components/container.css.js';
import { link } from '../components/link.js';
import { element as e, template } from '../dynamic-dom/index.js';
import { computed } from '../dynamic/dynamic.js';
import { showTokenStatus } from './showTokenStatus.js';
import { showSmallUID } from './showUID.js';
import { taskList } from './task-list.js';
import { taskUploader } from './task-upload.js';
import { tokenList } from './token-list.js';
import { tokenUploadForm } from './token-upload.js';

function authPart() {
	return e('div', { class: container },
		e('h3', '用户'),
		authClient(),
	);
}

function tokenPart() {
	return e('div', { class: container },
		e('h3', 'Token'),
		computed($ => {
			const t = $(myTokens);
			if (t.length === 0) {
				return e('p', { style: 'color:red;' }, '您还没有上传自己的 token！');
			}
			else {
				const qwq = $(authState);
				const [{ receiver, status }] = t;
				const shownReceiver = qwq.isLoginned && qwq.uid === receiver ? '您自己' : [' ', showSmallUID(receiver)];
				return e('p',
					template`您的 token 贡献给了${shownReceiver}，处于${showTokenStatus(status)}状态`,
				);
			}
		}),
		e('details',
			e('summary', '由您管理的 token 列表'),
			tokenList('receiver', receivedTokens, updateReceivedTokens),
		),
		e('details',
			e('summary', '上传或更新 token'),
			tokenUploadForm(authState),
		),
	);
}

/**@type {import('../router').Handler} */
export function drawClient(context) {
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
						return tokenPart();
					}
					else {
						return [];
					}
				}),
				e('div', { class: container },
					e('h3', '任务'),
					taskList(),
					taskUploader(),
				),
			)
		],
	};
}