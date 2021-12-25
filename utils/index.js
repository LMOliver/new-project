import { useStorage } from '../components/storage.js';
import { map, unbox } from '../dynamic';
import { optimizeEqual } from '../dynamic/utils.js';

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
 * @template {'GET'|'POST'|'HEAD'|'PUT'|'DELETE'} M
 * @template T
 * @template U
 * @param {string} url 
 * @param {M} method 
 * @param {M extends 'POST'|'HEAD'|'PUT'?T:undefined} body 
 * @returns {U}
 */
export async function JSONRequest(url, method, body = ['POST', 'HEAD', 'PUT'].includes(method) ? {} : undefined) {
	const result = await fetch(url, {
		headers: {
			'Content-Type': 'application/json',
		},
		method,
		...(body ? { body: JSON.stringify(body) } : {}),
	});
	if (!result.ok) {
		return result.text()
			.catch(() => {
				throw new Error(`${result.status} ${result.statusText}`);
			})
			.then(message => {
				throw new Error(message);
			});
	}
	else {
		return JSON.parse((await result.text()) || 'null');
	}
}

/**
 * @template T
 * @param {string} key
 * @param {(oldValue:T)=>Promise<T>} getter
 * @param {T} initial
 * @param {{stringify:(value:T)=>string,parse:(text:string)=>T}}
 */
export function localStorageHelper(key, getter, initial, { stringify, parse } = JSON) {
	const [box, set] = useStorage(localStorage, key);
	let pendingPromise = null;
	const box2 = map(optimizeEqual(box, (a, b) => a === b), v => v !== null ? parse(v) : initial);
	return {
		box: box2,
		set: (/**@type {T}*/value) => {
			set(stringify(value));
		},
		update: async () => {
			if (pendingPromise) {
				return pendingPromise;
			}
			else {
				pendingPromise = getter(unbox(box2))
					.then(result => {
						set(stringify(result));
					})
					.finally(() => {
						pendingPromise = null;
					});
			}
		},
	};
};