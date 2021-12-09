import { useBox, useSequenceDirty, computed, SequenceChangeType } from '../dynamic';
import { element as e } from './index.js';

describe('create', () => {
	test('with attr', () => {
		const element = e('a', { href: 'http://localhost/' }, 1234, 'aaa');
		expect(element.outerHTML).toEqual('<a href="http://localhost/">1234aaa</a>');
	});
	test('without attr', () => {
		const element = e('p', 1234, 'aaa');
		expect(element.outerHTML).toEqual('<p>1234aaa</p>');
	});
	test('child node', () => {
		const element = e('p', e('p', 233), 'aaa');
		expect(element.outerHTML).toEqual('<p><p>233</p>aaa</p>');
	});
	test('children as arrays', () => {
		const element = e('p', [233, 666], 'aaa');
		expect(element.outerHTML).toEqual('<p>233666aaa</p>');
	});
});

describe('dynamic', () => {
	describe('attribute', () => {
		test('plain', () => {
			const element = e('p', { 'data-a': '1' }, 'aaa');
			expect(element.outerHTML).toEqual('<p data-a="1">aaa</p>');
		});
		test('string', () => {
			const [box1, set1] = useBox('1');
			const element = e('p', { 'data-a': box1 }, 'aaa');
			expect(element.outerHTML).toEqual('<p data-a="1">aaa</p>');
			set1('2');
			expect(element.outerHTML).toEqual('<p data-a="2">aaa</p>');
			set1('');
			expect(element.outerHTML).toEqual('<p data-a="">aaa</p>');
			set1('3');
			expect(element.outerHTML).toEqual('<p data-a="3">aaa</p>');
		});
		test('number', () => {
			const [box1, set1] = useBox(1);
			const element = e('p', { 'data-a': box1 }, 'aaa');
			expect(element.outerHTML).toEqual('<p data-a="1">aaa</p>');
			set1(2);
			expect(element.outerHTML).toEqual('<p data-a="2">aaa</p>');
			set1(4);
			expect(element.outerHTML).toEqual('<p data-a="4">aaa</p>');
			set1(3);
			expect(element.outerHTML).toEqual('<p data-a="3">aaa</p>');
		});
		test('boolean', () => {
			const [box1, set1] = useBox(true);
			const element = e('p', { 'data-a': box1 }, 'aaa');
			expect(element.outerHTML).toEqual('<p data-a="">aaa</p>');
			set1(false);
			expect(element.outerHTML).toEqual('<p>aaa</p>');
			set1(true);
			expect(element.outerHTML).toEqual('<p data-a="">aaa</p>');
		});
	});
	describe('box', () => {
		test('create', () => {
			const [box1, set1] = useBox('1');
			const element = e('p', 'left', box1, 'right');
			expect(element.textContent).toEqual('left1right');
		});
		test('set', () => {
			const [box1, set1] = useBox('1');
			const element = e('p', 'left', box1, 'right');
			expect(element.textContent).toEqual('left1right');
			set1('2');
			expect(element.textContent).toEqual('left2right');
		});
		test('nested', () => {
			const [box1, set1] = useBox('1');
			const [box2, set2] = useBox([box1, box1]);
			const element = e('p', 'left', box2, 'right');
			expect(element.textContent).toEqual('left11right');
			set1('2');
			expect(element.textContent).toEqual('left22right');
			set2([box1, box1, box1]);
			expect(element.textContent).toEqual('left222right');
			set1('3');
			expect(element.textContent).toEqual('left333right');
		});
		test('computed', () => {
			const [box1, set1] = useBox(1);
			const box2 = computed($ => $(box1) + $(box1));
			const element = e('p', 'left', box2, 'right');
			expect(element.textContent).toEqual('left2right');
			set1(2);
			expect(element.textContent).toEqual('left4right');
			set1(3);
			expect(element.textContent).toEqual('left6right');
		});
	});
	describe('sequence', () => {
		test('create', () => {
			const [seq1, change1] = useSequenceDirty([1, 2, 3, 4, 5]);
			const element = e('p', seq1);
			expect(element.textContent).toEqual('12345');
		});
		test('insert', () => {
			const [seq1, change1] = useSequenceDirty([1, 2, 3, 4, 5]);
			const element = e('p', seq1);
			expect(element.textContent).toEqual('12345');
			change1([SequenceChangeType.insert, 2, 6]);
			expect(element.textContent).toEqual('126345');
		});
		test('set', () => {
			const [seq1, change1] = useSequenceDirty([1, 2, 3, 4, 5]);
			const element = e('p', seq1);
			expect(element.textContent).toEqual('12345');
			change1([SequenceChangeType.set, 2, 6]);
			expect(element.textContent).toEqual('12645');
		});
		test('delete', () => {
			const [seq1, change1] = useSequenceDirty([1, 2, 3, 4, 5]);
			const element = e('p', seq1);
			expect(element.textContent).toEqual('12345');
			change1([SequenceChangeType.delete, 2, null]);
			expect(element.textContent).toEqual('1245');
		});
		test('auto flat', () => {
			const [seq1, change1] = useSequenceDirty([1, 2, 3, 4, 5]);
			const element = e('p', seq1, seq1, seq1, seq1, seq1);
			expect(element.textContent).toEqual('1234512345123451234512345');
			change1([SequenceChangeType.delete, 2, null]);
			expect(element.textContent).toEqual('12451245124512451245');
		});
	});
});