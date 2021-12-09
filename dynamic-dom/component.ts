export interface ComponentConstructor<T extends any[], U extends HTMLElement> {
	new(...args: T): U;
}
export function component<T extends any[], U extends HTMLElement>(name: string, constructor: ComponentConstructor<T, U>)
	: (...args: T) => U {
	customElements.define(name, constructor as { new(...args: any[]): U; });
	return (...args: T) => new constructor(...args);
};