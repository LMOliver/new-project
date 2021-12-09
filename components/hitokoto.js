import { element as e } from '../dynamic-dom';
import { map, fromPromise } from '../dynamic';
import { getHitokoto } from '../hitokoto';
import { loading } from './loading.js';

const style = `text-align:right;font-size:small;`;
/**
@param {{
	description: string;
	href?: string | undefined;
}} source 
 * @returns 
 */
function displaySource({ description, href }) {
	return e('aside', { style }, href ? e('a', { href }, description) : description);
}

/**
 * @param {import('../hitokoto/index.js').Hitokoto} hitokoto 
 * @returns {import('../dynamic-dom/types.js').Supported}
 */
function displayHitokoto({ message, from, source }) {
	return [
		e('p', message),
		from ? e('aside', { style }, from) : [],
		source ? displaySource(source) : [],
	];
}

/**
 * @param {Error} error 
 * @returns {import('../hitokoto').Hitokoto}
 */
function convertErrorToHitokoto(error) {
	return {
		message: error.message,
		from: error.message.startsWith('她') ? '一言获取姬' : '不知是什么地方报错了',
	};
}

export function hitokoto() {
	return e('article', { style: 'text-align:center;' },
		loading(getHitokoto().then(displayHitokoto),
			() => e('p', '一言加载中……'),
			error => displayHitokoto(convertErrorToHitokoto(error)),
		),
	);
};