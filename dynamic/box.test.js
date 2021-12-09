import { map, unbox, useBox } from './dynamic.js';

describe('basic', () => {
	test('create', () => {
		const [box, set] = useBox(3);
		expect(unbox(box)).toEqual(3);
	});
	test('set', () => {
		const [box, set] = useBox(3);
		expect(unbox(box)).toEqual(3);
		set(4);
		expect(unbox(box)).toEqual(4);
		set(5);
		expect(unbox(box)).toEqual(5);
	});
});
describe('map', () => {
	test('create', () => {
		const [box, set] = useBox(3);
		const box2 = map(box, x => x * 2);
		expect(unbox(box2)).toEqual(6);
	});
	test('set', () => {
		const [box, set] = useBox(3);
		const box2 = map(box, x => x * 2);
		expect(unbox(box2)).toEqual(6);
		set(4);
		expect(unbox(box2)).toEqual(8);
		set(5);
		expect(unbox(box2)).toEqual(10);
	});
	test('chain', () => {
		const [box, set] = useBox(3);
		const box2 = map(box, x => x * 2);
		const box3 = map(box2, x => x + 1);
		expect(unbox(box3)).toEqual(7);
		set(4);
		expect(unbox(box3)).toEqual(9);
		set(5);
		expect(unbox(box3)).toEqual(11);
	});
});