import { last } from '../utils';
export function attemptParse(str) {
    try {
        return String(JSON.parse(str));
    }
    catch (e) {
        return str.slice(1, -1);
    }
}
var Parser = /** @class */ (function () {
    function Parser() {
        this.currentPrefix = '';
        this.tree = [];
        this.stack = [{
                tag: null,
                node: this.tree
            }];
    }
    Parser.prototype.execute = function (command) {
        switch (command[0]) {
            case 'indent-up': {
                var node = [];
                last(this.stack).node.push(node);
                this.stack.push({
                    tag: null,
                    node: node
                });
                break;
            }
            case 'indent-down': {
                while (last(this.stack).tag !== null) {
                    this.stack.pop();
                }
                if (this.stack.length > 1) {
                    this.stack.pop();
                }
                break;
            }
            case 'tag': {
                while (last(this.stack).tag !== null) {
                    this.stack.pop();
                }
                var node = [];
                last(this.stack).node.push(node);
                this.stack.push({
                    tag: command[1],
                    node: node
                });
                break;
            }
            case 'string': {
                var from = this.stack.map(function (x) { return x.tag; }).filter(function (x) { return x !== null; }).join('·');
                var content = this.currentPrefix + command[1];
                last(this.stack).node.push({ from: from, content: content });
                this.currentPrefix = '';
                break;
            }
            case 'string-prefix': {
                this.currentPrefix += command[1];
                break;
            }
        }
    };
    return Parser;
}());
export { Parser };
export function parse(tokens) {
    var parser = new Parser();
    for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
        var command = tokens_1[_i];
        parser.execute(command);
    }
    return parser.tree;
}
