import { computed } from './computed.js';
import { map, unbox, useBox } from './dynamic.js';
import { jest } from '@jest/globals';

test('create', () => {
	const [box1, set1] = useBox(3);
	const [box2, set2] = useBox(2);
	const box3 = computed($ => {
		return $(box1) + 2 * $(box2);
	});
	expect(unbox(box3)).toEqual(3 + 2 * 2);
});
test('set', () => {
	const [box1, set1] = useBox(3);
	const [box2, set2] = useBox(2);
	const box3 = computed($ => {
		return $(box1) + 2 * $(box2);
	});
	expect(unbox(box3)).toEqual(3 + 2 * 2);
	set1(5);
	expect(unbox(box3)).toEqual(5 + 2 * 2);
	set2(6);
	expect(unbox(box3)).toEqual(5 + 2 * 6);
});
describe('condition', () => {
	test('value', () => {
		const [box1, set1] = useBox(false);
		const [box2, set2] = useBox(2);
		const [box3, set3] = useBox(3);
		const box4 = computed($ => {
			return $(box1) ? [2, $(box2)] : [3, $(box3)];
		});
		expect(unbox(box4)).toEqual([3, 3]);
		set3(6);
		expect(unbox(box4)).toEqual([3, 6]);
		set1(true);
		expect(unbox(box4)).toEqual([2, 2]);
		set2(5);
		expect(unbox(box4)).toEqual([2, 5]);
		set3(7);
		expect(unbox(box4)).toEqual([2, 5]);
		set2(4);
		expect(unbox(box4)).toEqual([2, 4]);
		set1(false);
		expect(unbox(box4)).toEqual([3, 7]);
	});
	test('binding', () => {
		const [box1, set1] = useBox(false);
		const [box2, set2] = useBox(2);
		const [box3, set3] = useBox(3);
		const box4 = computed($ => {
			return $(box1) ? [2, $(box2)] : [3, $(box3)];
		});
		const callback = jest.fn();
		const cancel = box4.changes(callback);
		set2(5);
		expect(callback).toHaveBeenCalledTimes(0);
		set1(true);
		expect(callback).toHaveBeenCalledTimes(1);
		set2(6);
		expect(callback).toHaveBeenCalledTimes(2);
		set3(7);
		expect(callback).toHaveBeenCalledTimes(2);
		set1(false);
		expect(callback).toHaveBeenCalledTimes(3);
		set3(8);
		expect(callback).toHaveBeenCalledTimes(4);
		set2(9);
		expect(callback).toHaveBeenCalledTimes(4);
		cancel();
	});
});
describe('complex', () => {
	test('tree', () => {
		const [box1, set1] = useBox(1);
		const [box2, set2] = useBox(2);
		const [box3, set3] = useBox(3);
		const box4 = computed($ => 1 * $(box1) + 2 * $(box2));
		const box5 = computed($ => $(box4) + 3 * $(box3));
		expect(unbox(box5)).toEqual(1 * 1 + 2 * 2 + 3 * 3);
		set3(5);
		expect(unbox(box5)).toEqual(1 * 1 + 2 * 2 + 3 * 5);
		set2(6);
		expect(unbox(box5)).toEqual(1 * 1 + 2 * 6 + 3 * 5);
		set1(7);
		expect(unbox(box5)).toEqual(1 * 7 + 2 * 6 + 3 * 5);
	});
	test('chain', () => {
		const [box1, set1] = useBox(1);
		const box2 = computed($ => $(box1) + 1);
		const box3 = computed($ => $(box2) + 1);
		const box4 = computed($ => $(box3) + 1);
		const box5 = computed($ => $(box4) + 1);
		expect(unbox(box5)).toEqual(1 + 4);
		set1(2);
		expect(unbox(box5)).toEqual(2 + 4);
		set1(3);
		expect(unbox(box5)).toEqual(3 + 4);
	});
});
test('nested', () => {
	const [box1, set1] = useBox(1);
	const [box2, set2] = useBox(box1);
	const box3 = computed($ => $($(box2)));
	const [box4, set4] = useBox(4);
	expect(unbox(box3)).toEqual(1);
	set1(2);
	expect(unbox(box3)).toEqual(2);
	set1(3);
	expect(unbox(box3)).toEqual(3);
	set2(box4);
	expect(unbox(box3)).toEqual(4);
	set4(5);
	expect(unbox(box3)).toEqual(5);
});
test('bug1', () => {
	const [box1, set1] = useBox(0);
	const box2 = computed($ => $(map(box1, x => x !== 0)) ? 1 : 2);
	expect(unbox(box2)).toBe(2);
	set1(1);
	expect(unbox(box2)).toBe(1);
	set1(2);
	expect(unbox(box2)).toBe(1);
	set1(0);
	expect(unbox(box2)).toBe(2);
});