import { buildPaletteSync, distance, image, utils } from 'image-q';
import { element as e } from '../../dynamic-dom/index.js';
const COLORS = [
	[0, 0, 0], [255, 255, 255], [170, 170, 170], [85, 85, 85],
	[254, 211, 199], [255, 196, 206], [250, 172, 142], [255, 139, 131],
	[244, 67, 54], [233, 30, 99], [226, 102, 158], [156, 39, 176],
	[103, 58, 183], [63, 81, 181], [0, 70, 112], [5, 113, 151],
	[33, 150, 243], [0, 188, 212], [59, 229, 219], [151, 253, 220],
	[22, 115, 0], [55, 169, 60], [137, 230, 66], [215, 255, 7],
	[255, 246, 209], [248, 203, 140], [255, 235, 59], [255, 193, 7],
	[255, 152, 0], [255, 87, 34], [184, 63, 39], [121, 85, 72],
	[0, 0, 0, 0],
].map(([r, g, b, a = 255]) => utils.Point.createByRGBA(r, g, b, a));

const palette = (() => {
	const palette = new utils.Palette();
	for (const point of COLORS) {
		palette.add(point);
	}
	return palette;
})();

/**
@typedef {{
	clip:{
		top:number,
		bottom:number,
		left:number,
		right:number,
	},
	resize:{
		width:number|null,
		height:number|null,
	},
}} ConvertOptions
 */

/**
 * @param {ImageBitmap} bitmap
 * @param {ConvertOptions} options 
 */
export async function convertImage(bitmap, { clip: { top, bottom, left, right }, resize: { width, height } }) {
	const sourceSize = {
		width: bitmap.width - (left + right),
		height: bitmap.height - (top + bottom),
	};
	if (sourceSize.width < 0) {
		throw new Error('图像的宽度小于 0');
	}
	if (sourceSize.height < 0) {
		throw new Error('图像的高度小于 0');
	}
	function fromScale(scale) {
		return {
			width: Math.round(sourceSize.width * scale),
			height: Math.round(sourceSize.height * scale),
		};
	}
	const targetSize =
		width !== null
			? height !== null
				? { width, height }
				: fromScale(width / sourceSize.width)
			: height !== null
				? fromScale(height / sourceSize.height)
				: sourceSize;
	if (targetSize.width <= 0 || targetSize.height <= 0) {
		throw new Error('图像大小为 0');
	}
	if (targetSize.width >= 400 || targetSize.height >= 300) {
		throw new Error(`图像大小过大（${targetSize.width}×${targetSize.height}）`);
	}
	const canvas = e('canvas', targetSize);
	const ctx = canvas.getContext('2d');
	if (!ctx) {
		throw new Error('canvas is not supported');
	}
	ctx.drawImage(bitmap, left, top, sourceSize.width, sourceSize.height, 0, 0, targetSize.width, targetSize.height);
	const qwq = ctx.getImageData(0, 0, targetSize.width, targetSize.height);
	const q = new image.NearestColor(new distance.CIEDE2000());
	const qaq = q.quantize(utils.PointContainer.fromImageData(qwq), palette);
	let lastStep = performance.now();
	for (const { progress, pointContainer } of qaq) {
		if (pointContainer) {
			return new ImageData(
				new Uint8ClampedArray(pointContainer.toUint8Array().buffer),
				pointContainer.getWidth(),
				pointContainer.getHeight()
			);
		}
		const currentStep = performance.now();
		if (currentStep - lastStep > 100) {
			lastStep = currentStep;
			await new Promise(r => setTimeout(r, 0));
		}
	}
	throw new Error('QAQ');
}