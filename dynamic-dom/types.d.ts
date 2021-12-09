import { Cancel } from '../channel/channel';
import { Box, Sequence } from '../dynamic';

export type BasicSupported = Node | string | number;
export type Supported = Supported[] | Sequence<Supported> | BasicSupported;
type BoxLike<T> = T | Box<T>;
export type Attri<K extends string> = {
	[x in K]: BoxLike<
		x extends `$${infer type}`
		? type extends keyof HTMLElementEventMap ? (event: HTMLElementEventMap[type]) => any : EventListenerOrEventListenerObject
		: string | number | boolean
	>
};
export type Args<K extends string>
	= [...Supported[]]
	| [Exclude<Attri<K>, Supported>, ...Supported[]];