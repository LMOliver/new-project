/**@template T @typedef {import('./channel.js').Source<T>} Source */
/**@type {Source<never>} */
export const empty = _ => () => { };

const noop = _ => { };

/**
 * 这个函数基本上是专用于 `Sequence` 的。
 * 
 * 它应该满足以下性质：
 * 
 * - 第一个回调在被删除前总是第一个被调用；
 * 
 * - 在更新触发过程中加入、删除的回调都不会在这次触发中被调用。
 * 
 * @template T
 * @type {(_:Source<T>)=>Source<T>}
 */
export function makeShared(original) {
	/**@type {import('./channel.js').Callback<T>[]} */
	let listeners = [];
	let count = 0;
	/**@type {(value:T)=>void} */
	const emit = value => {
		const oldSize = listeners.length;
		for (let i = 0; i < oldSize; i++) {
			listeners[i](value);
		}
		listeners = listeners.filter(listener => listener !== noop);
	};
	/**@type {import('./channel.js').Cancel|null} */
	let cancel = null;
	return listener => {
		count++;
		listeners.push(listener);
		if (cancel === null) {
			cancel = original(emit);
		}
		return () => {
			listeners[listeners.lastIndexOf(listener)] = noop;
			count--;
			if (count === 0) {
				/**@type {import('./channel.js').Cancel}*/(cancel)();
				cancel = null;
			}
		};
	};
}
/**@template T,U @type {(_:Source<T>,__:(value:T)=>U)=>Source<U>} */
export function apply(source, transfrom) {
	return listener => source((value) => listener(transfrom(value)));
}
/**@template T,U @type {(_:Source<T>,__:(value:T,callback:(value:U)=>void)=>void)=>Source<U>} */
export function flatMap(source, callback) {
	return listener => source(value => callback(value, listener));
}

const reg = new FinalizationRegistry(cancel => {
	cancel();
});
/**@type {import('./channel.js').weakBind} */
export function weakBind(object, source, callback) {
	const ref = new WeakRef(object);
	reg.register(object, source(e => {
		const object = ref.deref();
		if (object) {
			callback(object, e);
		}
	}));
	return object;
}

/**@type {import('./channel.js').makeOnce} */
export function makeOnce(source) {
	let callback = null;
	const cancel = source(value => {
		if (callback !== null) {
			callback(value);
		}
	});
	return listener => {
		callback = listener;
		return cancel;
	};
}

/**@type {import('./channel.js').onceChannel} */
export function onceChannel() {
	let callback = noop;
	return [
		listener => {
			callback = listener;
			return () => {
				callback = noop;
			};
		},
		value => callback(value),
	];
}