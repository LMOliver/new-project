import { deepSample } from '../utils';
import { last } from '../utils/index';
import { attemptParse, parse } from './parser';

const BASE_INDENT = 0;
/**
 * @param {string} text
 */
function extract(text) {
	const begin = ' '.repeat(BASE_INDENT) + 'const says = {\n';
	const end = '\n' + ' '.repeat(BASE_INDENT) + '}';
	const beginIndex = text.indexOf(begin);
	const endIndex = text.indexOf(end);
	if (beginIndex === -1 || endIndex === -1) {
		return '';
	}
	else {
		return text.slice(beginIndex + begin.length, endIndex);
	}
}

/**
 * @param {string} text
 * @returns {Generator<import('./parser').Token, void>}
 */
function* tokenize(text) {
	const stack = [0];
	for (const line of text.split('\n').map(line => line.trimEnd())) {
		const expr = line.trimStart();
		if (expr === '') {
			continue;
		}
		const indent = Math.max(line.length - expr.length - BASE_INDENT, 0);
		while (indent < last(stack)) {
			yield ['indent-down'];
			stack.pop();
		}
		if (indent > last(stack)) {
			yield ['indent-up'];
			stack.push(indent);
		}

		const tag = expr.match(/'(?<content>(?:[^\\]|\\.)*)':\s*\[/);
		const string = expr.match(/'(?<content>(?:[^\\]|\\.)*)'(?!:)(?<flag>\+?)/);
		if (tag !== null) {
			if (string !== null) {
				yield ['indent-up'];
			}
			// @ts-ignore
			yield ['tag', tag.groups.content];
		}
		if (string !== null) {
			// @ts-ignore
			yield [string.groups.flag ? 'string-prefix' : 'string', attemptParse(`"${string.groups.content.replace(/\\'/g, `'`)}"`)];
		}
		if (tag !== null && string !== null) {
			yield ['indent-down'];
		}
	}
	stack.reverse().pop();
	for (const _ of stack) {
		yield ['indent-down'];
	}
}

/**
 * @returns {Promise<import('./index.js').Hitokoto>}
 */
export async function getDPairHitokoto() {
	return fetch('https://dpair2005.github.io/js/hitokoto.js')
		.then(r => r.text())
		.then(extract)
		.then(tokenize)
		.then(parse)
		.then(deepSample)
		.then(x => {
			if (x === undefined) {
				throw new Error('她尝试从 DPair 的博客中卡取一言，却什么也没得到。');
			}
			else {
				return x;
			}
		})
		.then(({ from, content }) => ({ message: content, from, source: { description: 'DPairの非自制 blog', href: 'https://dpair2005.github.io/' } }));
};;