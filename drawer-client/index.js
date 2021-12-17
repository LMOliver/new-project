import { authState } from '../api/auth.js';
import { myTokens, receivedTokens, updateMyTokens, updateReceivedTokens } from '../api/tokens.js';
import { authClient } from '../auth-client/index.js';
import { container } from '../components/container.css.js';
import { link } from '../components/link.js';
import { element as e } from '../dynamic-dom/index.js';
import { computed } from '../dynamic/dynamic.js';
import { imageList } from './image-list.js';
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
		e('details',
			e('summary', '我的 token'),
			tokenList(myTokens, updateMyTokens),
		),
		e('details',
			e('summary', '贡献给我的 token'),
			tokenList(receivedTokens, updateReceivedTokens),
		),
		tokenUploadForm(),
	);
}

/**@type {import('../router').Handler} */
export function drawClient(context) {
	return {
		head: [
			e('title', '绘板'),
		],
		body: [
			e('article', { class: container },
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
					imageList(),
				),
			)
		],
	};
}