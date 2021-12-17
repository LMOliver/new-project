import { element as e } from '../dynamic-dom/index.js';

/**
 * @param {string} uid
 * @returns {import('../dynamic-dom/types.js').Supported}
 */
export function showUID(uid) {
	const [id, site] = uid.split('@');
	if (site === 'Luogu') {
		return e('a', { href: `https://www.luogu.com.cn/user/${id}`, style: 'display:block;height:3em;' },
			e('img', {
				src: `https://cdn.luogu.com.cn/upload/usericon/${id}.png`,
				style: 'height:3em;width:3em;',
				title: uid,
				alt: uid,
			}),
		);
	}
	else {
		return uid;
	}
}
