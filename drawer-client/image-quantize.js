import { distance, image, utils } from 'image-q';
import { COLORS } from './constants.js';

const palette = (() => {
	const palette = new utils.Palette();
	for (const point of COLORS.map(([r, g, b, a = 255]) => utils.Point.createByRGBA(r, g, b, a)).concat([utils.Point.createByUint32(0)])) {
		palette.add(point);
	}
	return palette;
})();

function createReverseTable() {
	const qwqwq = palette.getPointContainer().toUint32Array();
	const a = Object.create(null);
	for (let i = 0; i < COLORS.length; i++) {
		a[qwqwq[i]] = i.toString(36).charCodeAt(0);
	}
	a[qwqwq[COLORS.length]] = '.'.charCodeAt(0);
	return a;
}

/**
 * @param {ImageData} imageData 
 * @returns {Promise<import('../api/api.js').TaskImage>}
 */
export async function quantize(imageData) {
	const table = createReverseTable();
	const q = new image.NearestColor(new distance.CIEDE2000());
	const qaq = q.quantize(utils.PointContainer.fromImageData(imageData), palette);
	let lastStep = performance.now();
	for (const { progress, pointContainer } of qaq) {
		if (pointContainer) {
			const td = new TextDecoder();
			const width = pointContainer.getWidth();
			const height = pointContainer.getHeight();
			const data = td.decode(new Uint8Array(pointContainer.toUint32Array().map(x => table[x])));
			return {
				width,
				height,
				data,
			};
		}
		const currentStep = performance.now();
		if (currentStep - lastStep > 100) {
			lastStep = currentStep;
			await new Promise(r => setTimeout(r, 0));
		}
	}
	throw new Error('impossible');
}