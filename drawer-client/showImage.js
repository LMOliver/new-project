import { element as e } from '../dynamic-dom/index.js';
import { COLORS } from './constants.js';

function createTable() {
	const table = new Uint8ClampedArray(256 * 4);
	COLORS.forEach((color, id) => {
		const code = id.toString(36).charCodeAt(0);
		for (let i = 0; i < 3; i++) {
			table[(code << 2) | i] = color[i];
		}
		table[(code << 2) | 3] = 255;
	});
	const code = '.'.charCodeAt(0);
	for (let i = 0; i < 4; i++) {
		table[(code << 2) | i] = 0;
	}
	return table;
}

/**
 * @param {import('../api-client/api.js').TaskImage} param0
 */
export function showImage({ width, height, data }) {
	const canvas = e('canvas', { width, height, style: 'image-rendering:pixelated;display:block;' });
	const ctx = canvas.getContext('2d');
	if (ctx === null) {
		throw new Error('canvas is not supported!');
	}
	const imageData = new ImageData(width, height);
	const table = createTable();
	let index = 0;
	let offset = 0;
	for (let i = 0; i < height; i++) {
		for (let j = 0; j < width; j++) {
			const id = /**@type {number}*/ (data.codePointAt(index)) << 2;
			for (let k = 0; k !== 4; k++) {
				imageData.data[offset | k] = table[id | k];
			}
			index++;
			offset += 4;
		}
	}
	ctx.putImageData(imageData, 0, 0);
	return canvas;
}
