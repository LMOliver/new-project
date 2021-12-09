/**
 * @param {string} html 
 * @returns {Element[]}
 */
export function dangerouslyParseHTML(html) {
	const element = document.createElement('div');
	element.innerHTML = html;
	const nodes = [...element.children];
	element.textContent = '';
	return nodes;
}