/**
 * @returns {Promise<import('./index.js').Hitokoto>}
 */
export async function getYiYanHitokoto() {
	const resp = await fetch('https://v1.hitokoto.cn/');
	/**
	 * https://developer.hitokoto.cn/sentence/#%E8%BF%94%E5%9B%9E%E6%A0%BC%E5%BC%8F
	@type {{
		hitokoto: unknown,
		from: unknown,
		uuid: unknown;
	}} */
	const { hitokoto, from, uuid } = await resp.json();
	return {
		message: String(hitokoto),
		from: String(from),
		source: {
			description: 'Hitokoto',
			href: `https://hitokoto.cn?uuid=${uuid}`,
		},
	};
}