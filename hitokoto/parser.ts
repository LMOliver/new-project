import { last } from '../utils';

export function attemptParse(str: string) {
	try {
		return String(JSON.parse(str));
	}
	catch (e) {
		return str.slice(1, -1);
	}
}

export type Token =
	readonly ["indent-down"]
	| readonly ["indent-up"]
	| readonly ["tag", string]
	| readonly ["string", string]
	| readonly ["string-prefix", string];
type ParsedTreeNode = { from: string, content: string; } | ParsedTreeNode[];
type ParsedTree = ParsedTreeNode[];
export class Parser {
	currentPrefix: string = '';
	tree: ParsedTree = [];
	stack: { tag: null | string, node: ParsedTree; }[] = [{
		tag: null,
		node: this.tree
	}];
	constructor() { }
	execute(command: Token) {
		switch (command[0]) {
			case 'indent-up': {
				const node: ParsedTree = [];
				last(this.stack)!.node.push(node);
				this.stack.push({
					tag: null,
					node,
				});
				break;
			}
			case 'indent-down': {
				while (last(this.stack)!.tag !== null) {
					this.stack.pop();
				}
				if (this.stack.length > 1) {
					this.stack.pop();
				}
				break;
			}
			case 'tag': {
				while (last(this.stack)!.tag !== null) {
					this.stack.pop();
				}
				const node: ParsedTree = [];
				last(this.stack)!.node.push(node);
				this.stack.push({
					tag: command[1],
					node,
				});
				break;
			}
			case 'string': {
				const from = this.stack.map(x => x.tag).filter(x => x !== null).join('·');
				const content = this.currentPrefix + command[1];
				last(this.stack)!.node.push({ from, content });
				this.currentPrefix = '';
				break;
			}
			case 'string-prefix': {
				this.currentPrefix += command[1];
				break;
			}
		}
	}
}
export function parse(tokens: Generator<Token, void>): ParsedTree {
	const parser = new Parser();
	for (const command of tokens) {
		parser.execute(command);
	}
	return parser.tree;
}