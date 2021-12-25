import { getUser } from '../api-client/user.js';
import { link } from '../components/link.js';
import { loading } from '../components/loading.js';
import { element as e, template as t } from '../dynamic-dom/index.js';
import { computed } from '../dynamic/dynamic.js';
import { showSmallUID } from './showUID.js';
import { tokenUploadForm } from './token-upload.js';

/**@type {import('../router/index.js').Handler} */
export function contributorClient(context) {
	const target = computed($ => $(context.path).search.get('to'));
	const user = computed($ => /^[1-9]\d{0,7}$/.test($(target) || '')
		? getUser($(target) + '@Luogu')
		: Promise.reject(new Error(`链接格式：${location.origin}/drawer/contributor?to=<uid>`))
	);
	return {
		head: [
			e('title', computed($ => loading($(user).then(x => `向 ${x.name} 贡献 token`).catch(() => '贡献 token'), () => '加载中……'))),
		],
		body: [
			computed($ => loading($(user)
				.then(x => [
					e('h1', t`向 ${showSmallUID(x.uid)} 贡献 token`),
					tokenUploadForm(x.uid),
				]),
				() => '加载中……',
				error => e('p', { style: 'color:red;' }, error.message || error.toString())
			)),
			e('p', link('/drawer', '我想自己收集 token 画图'))
		],
	};
}