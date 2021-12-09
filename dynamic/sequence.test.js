import { empty } from '../channel/channel';
import { flat, makeSequenceDirty, map, SequenceChangeType } from './dynamic';

describe('create', () => {
	test('empty', () => {
		const sequence = makeSequenceDirty([], empty);
		expect(sequence.current).toEqual([]);
	});
	test('nonempty', () => {
		const a = Symbol('a');
		const b = Symbol('b');
		const sequence = makeSequenceDirty([a, b], empty);
		expect(sequence.current).toEqual([a, b]);
	});
});

describe('basic', () => {
	test('insert', () => {
		const sequence = makeSequenceDirty([1, 2, 3, 4, 5], callback => {
			callback([SequenceChangeType.insert, 2, 6]);
			return () => { };
		});
		expect(sequence.current).toEqual([1, 2, 6, 3, 4, 5]);
	});
	test('set', () => {
		const sequence = makeSequenceDirty([1, 2, 3, 4, 5], callback => {
			callback([SequenceChangeType.set, 2, 6]);
			return () => { };
		});
		expect(sequence.current).toEqual([1, 2, 6, 4, 5]);
	});
	test('delete', () => {
		const sequence = makeSequenceDirty([1, 2, 3, 4, 5], callback => {
			callback([SequenceChangeType.delete, 2, null]);
			return () => { };
		});
		expect(sequence.current).toEqual([1, 2, 4, 5]);
	});
});

describe('map', () => {
	test('create', () => {
		const sequence = makeSequenceDirty([1, 2, 3, 4, 5], empty);
		const target = map(sequence, x => x * 2);
		expect(target.current).toEqual([2, 4, 6, 8, 10]);
	});
	test('insert', () => {
		/** @type {import('../channel/channel').Callback<import('./dynamic').SequenceChange<number>>} */
		let callback = () => { };
		const sequence = makeSequenceDirty([1, 2, 3, 4, 5], c => {
			callback = c;
			return () => {
				callback = () => { };
			};
		});
		const target = map(sequence, x => x * 2);
		expect(target.current).toEqual([2, 4, 6, 8, 10]);
		callback([SequenceChangeType.insert, 2, 6]);
		expect(target.current).toEqual([2, 4, 12, 6, 8, 10]);
	});
	test('set', () => {
		/** @type {import('../channel/channel').Callback<import('./dynamic').SequenceChange<number>>} */
		let callback = () => { };
		const sequence = makeSequenceDirty([1, 2, 3, 4, 5], c => {
			callback = c;
			return () => {
				callback = () => { };
			};
		});
		const target = map(sequence, x => x * 2);
		expect(target.current).toEqual([2, 4, 6, 8, 10]);
		callback([SequenceChangeType.set, 2, 6]);
		expect(target.current).toEqual([2, 4, 12, 8, 10]);
	});
	test('delete', () => {
		/** @type {import('../channel/channel').Callback<import('./dynamic').SequenceChange<number>>} */
		let callback = () => { };
		const sequence = makeSequenceDirty([1, 2, 3, 4, 5], c => {
			callback = c;
			return () => {
				callback = () => { };
			};
		});
		const target = map(sequence, x => x * 2);
		expect(target.current).toEqual([2, 4, 6, 8, 10]);
		callback([SequenceChangeType.delete, 2, null]);
		expect(target.current).toEqual([2, 4, 8, 10]);
	});
});

describe('flat', () => {
	function makeConstSequence() {
		return makeSequenceDirty([1, 2, 3, 4, 5], empty);
	}
	test('create', () => {
		const sequence =
			makeSequenceDirty([
				makeConstSequence(),
				makeConstSequence(),
				makeConstSequence(),
				makeConstSequence(),
			], empty);
		const target = flat(sequence);
		expect(target.current).toEqual([1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5]);
	});
	describe('inner', () => {
		test('insert', () => {
			/** @type {import('../channel/channel').Callback<import('./dynamic').SequenceChange<number>>} */
			let callback1 = () => { };
			/** @type {import('../channel/channel').Callback<import('./dynamic').SequenceChange<number>>} */
			let callback2 = () => { };
			const sequence =
				makeSequenceDirty([
					makeConstSequence(),
					makeSequenceDirty([1, 2, 3, 4, 5], c => {
						callback1 = c;
						return () => {
							callback1 = () => { };
						};
					}),
					makeSequenceDirty([1, 2, 3, 4, 5], c => {
						callback2 = c;
						return () => {
							callback2 = () => { };
						};
					}),
					makeConstSequence(),
				], empty);
			const target = flat(sequence);
			expect(target.current).toEqual([1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5]);
			callback1([SequenceChangeType.insert, 2, 6]);
			expect(target.current).toEqual([1, 2, 3, 4, 5, 1, 2, 6, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5]);
			callback2([SequenceChangeType.insert, 2, 6]);
			expect(target.current).toEqual([1, 2, 3, 4, 5, 1, 2, 6, 3, 4, 5, 1, 2, 6, 3, 4, 5, 1, 2, 3, 4, 5]);
		});
		test('set', () => {
			/** @type {import('../channel/channel').Callback<import('./dynamic').SequenceChange<number>>} */
			let callback1 = () => { };
			/** @type {import('../channel/channel').Callback<import('./dynamic').SequenceChange<number>>} */
			let callback2 = () => { };
			const sequence =
				makeSequenceDirty([
					makeConstSequence(),
					makeSequenceDirty([1, 2, 3, 4, 5], c => {
						callback1 = c;
						return () => {
							callback1 = () => { };
						};
					}),
					makeSequenceDirty([1, 2, 3, 4, 5], c => {
						callback2 = c;
						return () => {
							callback2 = () => { };
						};
					}),
					makeConstSequence(),
				], empty);
			const target = flat(sequence);
			expect(target.current).toEqual([1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5]);
			callback1([SequenceChangeType.set, 2, 6]);
			expect(target.current).toEqual([1, 2, 3, 4, 5, 1, 2, 6, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5]);
			callback2([SequenceChangeType.set, 2, 6]);
			expect(target.current).toEqual([1, 2, 3, 4, 5, 1, 2, 6, 4, 5, 1, 2, 6, 4, 5, 1, 2, 3, 4, 5]);
		});
		test('delete', () => {
			/** @type {import('../channel/channel').Callback<import('./dynamic').SequenceChange<number>>} */
			let callback1 = () => { };
			/** @type {import('../channel/channel').Callback<import('./dynamic').SequenceChange<number>>} */
			let callback2 = () => { };
			const sequence =
				makeSequenceDirty([
					makeConstSequence(),
					makeSequenceDirty([1, 2, 3, 4, 5], c => {
						callback1 = c;
						return () => {
							callback1 = () => { };
						};
					}),
					makeSequenceDirty([1, 2, 3, 4, 5], c => {
						callback2 = c;
						return () => {
							callback2 = () => { };
						};
					}),
					makeConstSequence(),
				], empty);
			const target = flat(sequence);
			expect(target.current).toEqual([1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5]);
			callback1([SequenceChangeType.delete, 2, null]);
			expect(target.current).toEqual([1, 2, 3, 4, 5, 1, 2, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5]);
			callback2([SequenceChangeType.delete, 2, null]);
			expect(target.current).toEqual([1, 2, 3, 4, 5, 1, 2, 4, 5, 1, 2, 4, 5, 1, 2, 3, 4, 5]);
		});
	});
	describe('outer', () => {
		test('insert', () => {
			/** @type {import('../channel/channel').Callback<import('./dynamic').SequenceChange<import('./dynamic.js').Sequence<number>>>} */
			let callback1 = () => { };
			const sequence =
				makeSequenceDirty([
					makeConstSequence(),
					makeConstSequence(),
					makeConstSequence(),
				], c => {
					callback1 = c;
					return () => {
						callback1 = () => { };
					};
				});
			const target = flat(sequence);
			expect(target.current).toEqual([1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5]);
			/** @type {import('../channel/channel').Callback<import('./dynamic').SequenceChange<number>>} */
			let callback2 = () => { };
			const newSequence = makeSequenceDirty([6, 7, 8, 9, 10], c => {
				callback2 = c;
				return () => {
					callback2 = () => { };
				};
			});
			callback1([SequenceChangeType.insert, 2, newSequence]);
			expect(target.current).toEqual([1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 1, 2, 3, 4, 5]);
			callback2([SequenceChangeType.insert, 2, 11]);
			expect(target.current).toEqual([1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 6, 7, 11, 8, 9, 10, 1, 2, 3, 4, 5]);
		});
		test('set', () => {
			/** @type {import('../channel/channel').Callback<import('./dynamic').SequenceChange<import('./dynamic.js').Sequence<number>>>} */
			let callback1 = () => { };
			const sequence =
				makeSequenceDirty([
					makeConstSequence(),
					makeConstSequence(),
					makeConstSequence(),
				], c => {
					callback1 = c;
					return () => {
						callback1 = () => { };
					};
				});
			const target = flat(sequence);
			expect(target.current).toEqual([1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5]);
			/** @type {import('../channel/channel').Callback<import('./dynamic').SequenceChange<number>>} */
			let callback2 = () => { };
			const newSequence = makeSequenceDirty([6, 7, 8, 9, 10], c => {
				callback2 = c;
				return () => {
					callback2 = () => { };
				};
			});
			callback1([SequenceChangeType.set, 2, newSequence]);
			expect(target.current).toEqual([1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
			callback2([SequenceChangeType.set, 2, 11]);
			expect(target.current).toEqual([1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 6, 7, 11, 9, 10]);
		});
		test('delete', () => {
			/** @type {import('../channel/channel').Callback<import('./dynamic').SequenceChange<import('./dynamic.js').Sequence<number>>>} */
			let callback1 = () => { };
			const sequence =
				makeSequenceDirty([
					makeConstSequence(),
					makeConstSequence(),
					makeConstSequence(),
				], c => {
					callback1 = c;
					return () => {
						callback1 = () => { };
					};
				});
			const target = flat(sequence);
			expect(target.current).toEqual([1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5]);
			callback1([SequenceChangeType.delete, 2, null]);
			expect(target.current).toEqual([1, 2, 3, 4, 5, 1, 2, 3, 4, 5]);
		});
	});
});