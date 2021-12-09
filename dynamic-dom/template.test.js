import { element as e, template } from './index.js';

test('basic', () => {
	const children = template`1${2.3}4${'5'}6${new Text('7')}`;
	expect(children).toHaveLength(2);
	const element = e('p', children);
	expect(element.outerHTML).toEqual('<p>12.34567</p>');
});