import { ensure } from '../ensure/index.js';

/**
 * @template T
 * @param {T[]} array 
 */
export function last(array) {
	return array[array.length - 1];
}
/**
 * @template T
 * @param {T[]} array 
 */
export function sample(array) {
	return array[Math.floor(Math.random() * array.length)];
}
/**
 * @template T
 * @param {import('./types.js').DeepArray<T>} value 
 * @returns {T|undefined}
 */
export function deepSample(value) {
	return Array.isArray(value) ? deepSample(sample(value)) : value;
}

/**
 * @param {string} href 
 */
export function isLocal(href) {
	const url = new URL(href);
	return url.host === location.host && url.protocol === location.protocol;
}

const registry = new FinalizationRegistry(url => {
	console.log('Bye', url);
	URL.revokeObjectURL(url);
});
/**
 * @param {Blob} blob
 */
export function createImageElement(blob) {
	const image = document.createElement('img');
	const url = URL.createObjectURL(blob);
	image.src = url;
	registry.register(image, url);
	return image;
}

/**
 * @template T
 * @template U
 * @param {string} url 
 * @param {'GET'|'POST'|'HEAD'|'PUT'|'DELETE'} method 
 * @param {T} body 
 * @returns {U}
 */
export async function JSONRequest(url, method, body) {
	const result = await fetch(url, {
		headers: {
			'content-type': 'application/json',
		},
		method,
		body: JSON.stringify(body),
	});
	if (!result.ok) {
		return result.text()
			.then(message => {
				throw new Error(message);
			})
			.catch(() => {
				throw new Error(`${result.status} ${result.statusText}`);
			});
	}
	else {
		return result.json();
	}
}

const qwq = ensure({ type: 'string', pattern: /^[0-9a-f]{8}\-[0-9a-f]{4}\-[0-9a-f]{4}\-[0-9a-f]{4}\-[0-9a-f]{12}$/i });
/**
 * @param {unknown} value 
 */
export const ensureUUID = value => qwq(value).toLowerCase();