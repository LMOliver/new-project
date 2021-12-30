import { element as e } from '../dynamic-dom/index.js';

const TABLE1 = {
	invalid: { color: 'red', text: '失效' },
	busy: { color: 'orange', text: '占用' },
	waiting: { color: 'blue', text: '未知' },
	working: { color: 'green', text: '有效' },
};

/**
 * @param {import('../api-client/tokens.js').TokenInfo['status']} tokenStatus 
 */
export function showTokenStatus(tokenStatus) {
	const { color, text } = TABLE1[tokenStatus];
	return e('span', { style: `color:${color};` }, text);
}