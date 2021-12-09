import { last, deepSample } from '../utils';
import { attemptParse, parse } from './parser';

const BASE_INDENT = 4;
/**
 * @param {string} text
 */
function extract(text) {
	const begin = ' '.repeat(BASE_INDENT) + 'const DAILY_MESSAGES=[\n';
	const end = '\n' + ' '.repeat(BASE_INDENT) + '];';
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

		const comment = expr.match(/\/\/(?<content>.*)$/);
		const string = expr.match(/'(?<content>(?:[^\\]|\\.)*)'(?<flag>\+?)/);
		if (comment !== null) {
			if (string !== null) {
				yield ['indent-up'];
			}
			// @ts-ignore
			yield ['tag', comment.groups.content];
		}
		if (string !== null) {
			// @ts-ignore
			yield [string.groups.flag ? 'string-prefix' : 'string', attemptParse(`"${string.groups.content.replace(/\\'/g, `'`)}"`)];
		}
		if (comment !== null && string !== null) {
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
export async function getXYiXHitokoto() {
	return fetch('https://xyix.github.io/js/daily.js')
		.then(r => r.text())
		.then(extract)
		.then(tokenize)
		.then(parse)
		.then(deepSample)
		.then(x => {
			if (x === undefined) {
				throw new Error('她尝试从 x义x 的博客中卡取一言，却什么也没得到。');
			}
			return x;
		})
		.then(({ from, content }) => ({ message: content, from, source: { description: 'x义x 的 blog', href: 'https://xyix.github.io' } }));
};;