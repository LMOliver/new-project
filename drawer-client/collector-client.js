import { authState } from '../api-client/auth.js';
import { receivedTokens, updateReceivedTokens } from '../api-client/tokens.js';
import { authClient } from '../auth-client/index.js';
import { container, globalContainer } from '../components/container.css.js';
import { copyableText } from '../components/copyableText.js';
import { link } from '../components/link.js';
import { element as e, template } from '../dynamic-dom/index.js';
import { computed } from '../dynamic/dynamic.js';
import { taskList } from './task-list.js';
import { taskUploader } from './task-upload.js';
import { tokenDeleteUI } from './token-delete.js';
import { tokenList } from './token-list.js';
import { tokenUploadForm } from './token-upload.js';

function authPart() {
	return e('div', { class: container },
		e('h3', '用户'),
		authClient(),
	);
}

/**
 * @param {string} uid 
 */
function tokenPart(uid) {
	return e('div', { class: container },
		e('h3', 'Token'),
		e('p', template`其他人可以访问 ${copyableText(`${location.origin}/drawer/contributor?to=${uid.split('@')[0]}`)} 向您贡献 token。`),
		e('details',
			e('summary', 'token 列表'),
			tokenList(receivedTokens, updateReceivedTokens),
		),
		e('details',
			e('summary', '提交 token'),
			tokenUploadForm(uid),
		),
		e('details',
			e('summary', '导出并删除 token'),
			tokenDeleteUI(),
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
							tokenPart(state.uid),
							e('div', { class: container },
								e('h3', '任务'),
								e('p', '为了提高 token 效率，避免冲突，网站管理员可能会手动修改图像的位置。'),
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
