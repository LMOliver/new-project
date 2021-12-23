import { element as e } from '../dynamic-dom/index.js';

/**
 * @param {string} uid
 * @returns {import('../dynamic-dom/types.js').Supported}
 */
export function showUID(uid) {
	const [id, site] = uid.split('@');
	if (site === 'Luogu' && /^[1-9]\d*$/.test(id)) {
		return e('a', { href: `https://www.luogu.com.cn/user/${id}`, style: 'display:block;height:3em;' },
			e('img', {
				src: `https://cdn.luogu.com.cn/upload/usericon/${id}.png`,
				style: 'height:3em;width:3em;',
				title: `uid=${id}`,
				alt: id,
			}),
		);
	}
	else {
		return uid;
	}
}

/**
 * @param {string} uid
 */
export function showSmallUidImage(uid) {
	const [id, site] = uid.split('@');
	if (site === 'Luogu' && /^[1-9]\d*$/.test(id)) {
		return e('img', {
			src: `https://cdn.luogu.com.cn/upload/usericon/${id}.png`,
			style: 'height:1em;width:1em;border-radius:0.5em;position:relative;top:2.5px;',
			alt: id,
		});
	}
	else {
		return [];
	}
}

/**
 * @param {string} uid
 * @returns {import('../dynamic-dom/types.js').Supported}
 */
export function showSmallUID(uid) {
	const [id, site] = uid.split('@');
	if (site === 'Luogu' && /^[1-9]\d*$/.test(id)) {
		return [
			e('a', { href: `https://www.luogu.com.cn/user/${id}`, style: 'display:inline-block;height:1em;' },
				// showSmallUidImage(uid),
				id,
			),
		];
	}
	else {
		return uid;
	}
}