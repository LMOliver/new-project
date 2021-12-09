import { empty, weakBind } from '../channel';
import { flat, makeConstantBox, map, Sequence, SequenceChangeType, unbox } from '../dynamic';
export { valueBox } from './binding.js';

/**
 * @param {Text} object 
 * @param {[import('../dynamic').SequenceChangeType.set,0,string]} change 
 */
function applyTextChange(object, [, , value]) {
	object.data = value;
}
/**@param {import('../dynamic/dynamic.js').Box<string>} box*/
export function text({ current, changes }) {
	return weakBind(new Text(current[0]), changes, applyTextChange);
}

/**
 * @param {Node} object 
 * @param {import('../dynamic/dynamic.js').SequenceChange<Node>} change 
 */
function applyChildrenChange(object, change) {
	switch (change[0]) {
		case SequenceChangeType.insert: {
			object.insertBefore(
				change[2],
				change[1] === object.childNodes.length ? null : object.childNodes[change[1]]
			);
			break;
		}
		case SequenceChangeType.set: {
			if (object.childNodes[change[1]] !== change[2]) {
				object.replaceChild(change[2], object.childNodes[change[1]]);
			}
			break;
		}
		case SequenceChangeType.delete: {
			object.removeChild(object.childNodes[change[1]]);
			break;
		}
	}
}
/**
 * @param {Node} parent 
 * @param {import('../dynamic/dynamic.js').Sequence<Node>} sequence
 */
export function bindChildren(parent, { current, changes }) {
	parent.textContent = '';
	for (const node of current) {
		parent.appendChild(node);
	}
	weakBind(parent, changes, applyChildrenChange);
}

/**
 * @param {import('./types.js').Supported} value 
 * @returns {Sequence<Node>}
 */
export function deepTransform(value) {
	if (Array.isArray(value)) {
		const flatten = value.flat(Infinity);
		if (flatten.length === 1) {
			return deepTransform(flatten[0]);
		}
		else {
			return flat(new Sequence(flatten.map(deepTransform), empty));
		}
	}
	else if (value instanceof Sequence) {
		return flat(map(value, deepTransform));
	}
	else if (value instanceof Node) {
		return makeConstantBox(value);
	}
	else {
		return makeConstantBox(new Text(value.toString()));
	}
}

/**@param {string} key */
function applyAttributeChange(key) {
	/**
	 * @param {Element} element
	@param {[1,0,string|number|boolean]} change
	 */
	return (element, [, , value]) => {
		if (typeof value !== 'boolean') {
			element.setAttribute(key, value.toString());
		}
		else {
			element.toggleAttribute(key, value);
		}
	};
}

/**
 * @param {Element} element
 * @param {string} key 
 * @param {import('../dynamic').Box<string|number|boolean>} box 
 */
function bindAttribute(element, key, box) {
	const value = unbox(box);
	if (typeof value !== 'boolean') {
		element.setAttribute(key, value.toString());
	}
	else {
		element.toggleAttribute(key, value);
	}
	weakBind(element, box.changes, applyAttributeChange(key));
}
/**@param {string} key @param {EventListener} initial*/
function makeEventListenerChanger(key, initial) {
	let lastListener = initial;
	/**
	 * @param {Element} element
	@param {[SequenceChangeType.set,0,EventListener]} change
	 */
	return (element, [, , value]) => {
		element.removeEventListener(key, lastListener);
		element.addEventListener(key, value);
		lastListener = value;
	};
}
/**
 * @param {Element} element
 * @param {string} key 
 * @param {import('../dynamic').Box<EventListener>} value 
 */
function bindEventListener(element, key, value) {
	const initial = unbox(value);
	element.addEventListener(key, initial);
	weakBind(element, value.changes, makeEventListenerChanger(key, initial));
}
/**
 * @template {keyof HTMLElementTagNameMap} T
 * @template {string} K
 * @param {T} tagName 
 * @param {import('./types.js').Attri<K>} attributes 
 * @param {import('./types.js').Supported[]} children 
 */
function _element(tagName, attributes, children) {
	const element = document.createElement(tagName);
	for (const key in attributes) {
		const value = attributes[key];
		if (key.startsWith('$')) {
			if (typeof value === 'function') {
				element.addEventListener(key.slice(1), value);
			}
			else {
				bindEventListener(element, key.slice(1),/**@type {import('../dynamic').Box<EventListener>} */(value));
			}
		}
		else {
			if (typeof value !== 'object') {
				// @ts-ignore
				bindAttribute(element, key, makeConstantBox(value));
			}
			else {
				bindAttribute(element, key, value);
			}
		}
	}
	bindChildren(element, deepTransform(children));
	return element;
}

/**
 * @template {keyof HTMLElementTagNameMap} T
 * @template {string} K
 * @param {import('./types.js').Args<K>} args 
 * @returns {args is [import('./types.js').Attri<K>,...import('./types.js').Supported[]]}
 */
export function isLeft(args) {
	return typeof args[0] === 'object' && !Array.isArray(args[0]) && !(args[0] instanceof Sequence) && !(args[0] instanceof Node);
}

/**
 * @template {keyof HTMLElementTagNameMap} T
 * @template {string} K
 * @param {T} tagName 
 * @param {import('./types.js').Args<K>} args 
 */
export function element(tagName, ...args) {
	if (isLeft(args)) {
		const [attr, ...children] = args;
		return _element(tagName, attr, children);
	}
	else {
		return _element(tagName, {}, args);
	}
}

/**
 * @param {TemplateStringsArray} template
 * @param {import('./types.js').Supported[]} substitutions
 * @returns {import('./types.js').Supported[]}
 */
export function template(template, ...substitutions) {
	/**
	 * @type {import('./types.js').Supported[]}
	 */
	let result = [];
	/**
	 * @param {import('./types.js').Supported} item 
	 */
	function add(item) {
		if (item === '') {
			return;
		}
		if (typeof item === 'number') {
			item = item.toString();
		}
		if (result.length !== 0 && typeof result[result.length - 1] === 'string' && typeof item === 'string') {
			result[result.length - 1] += item;
		}
		else {
			result.push(item);
		}
	}
	for (let i = 0; i < template.length; i++) {
		add(template[i]);
		if (i < substitutions.length) {
			add(substitutions[i]);
		}
	}
	return result;
}