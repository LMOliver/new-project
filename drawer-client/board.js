import { board } from '../api/board.js';
import { loading } from '../components/loading.js';
import { element as e } from '../dynamic-dom/index.js';
import { useBox } from '../dynamic/dynamic.js';
import { COLORS, HEIGHT, WIDTH } from './constants.js';

/**
@param {{
	width: number;
	height: number;
	data: Uint8Array;
}} data 
 * @returns {ImageData}
 */
function decode({ width, height, data }) {
	let result = new Uint8ClampedArray(width * height * 4);
	let index = 0;
	for (let i = 0; i < width; i++) {
		for (let j = 0; j < height; j++) {
			const color = COLORS[data[index++]];
			const offset = (j * width + i) << 2;
			for (let k = 0; k !== 3; k++) {
				result[offset | k] = color[k];
			}
			result[offset | 3] = 255;
		}
	}
	return new ImageData(result, width, height);
}

/**
@type {Promise<{
    width: number;
    height: number;
    data: Uint8Array;
}>|null}
 */
let boardCache = null;
function qaq() {
	if (boardCache === null) {
		boardCache = board().catch(error => {
			boardCache = null;
			throw error;
		});
	}
	return boardCache;
}

export function boardDisplayer() {
	const [qwq, setQWQ] = useBox(
		/**@type {import('../dynamic-dom/types.js').Supported} */
		(e('div', { style: `width:${WIDTH};height:${HEIGHT};background:rgb(${COLORS[2].join(',')});` }))
	);
	return [qwq, loading(
		qaq().then(decode).then(imageData => {
			const canvas = e('canvas', { width: WIDTH, height: HEIGHT, style: 'image-rendering:pixelated;' });
			const ctx = canvas.getContext('2d');
			if (ctx === null) {
				return '您的浏览器不支持 canvas';
			}
			ctx.putImageData(imageData, 0, 0);
			setQWQ(canvas);
		}).then(() => []),
		() => '加载中……',
		error => e('p', { style: 'color:red;' }, error.message || error.toString())
	)];
}