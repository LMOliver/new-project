import { container } from '../components/container.css.js';
import { link } from '../components/link.js';
import { loading } from '../components/loading.js';
import { element as e, template as t, valueBox } from '../dynamic-dom/index.js';
import { computed } from '../dynamic/computed.js';
import { map } from '../dynamic/dynamic.js';
import { router } from '../router/index.js';

function showSize({ width, height }) {
	const size = width * height;
	return `（${width}×${height}=${size}）`;
}

/**
 * @param {File} file 
 */
function processor(file) {
	const options = [
		{ name: '上', step: 1, initial: 0 },
		{ name: '下', step: 1, initial: 0 },
		{ name: '左', step: 1, initial: 0 },
		{ name: '右', step: 1, initial: 0 },
		{ name: '缩放', step: 0.1, initial: 1 },
		{ name: '大小', step: 1, initial: 1 },
	];
	const inputs = options.map(({ name, step, initial }) => {
		const input = e('input', { type: 'number', min: 0, name, step, value: initial });
		return {
			element: e('div', e('label', name, input)),
			box: valueBox(input),
		};
	});
	const inputBoxes = inputs.map(input => input.box);
	const promise = createImageBitmap(file)
		.then(bitmap => {
			const canvas = e('canvas', { class: container, style: 'padding:0;image-rendering:pixelated;' });
			const displayer = e('p', canvas);
			return computed($ => {
				const ctx = canvas.getContext('2d');
				if (!ctx) {
					return e('p', t`⚠ 您的浏览器不支持 ${e('code', 'canvas')}`);
				}
				const clips = inputBoxes.map($).map(Number);
				if (clips.some(Number.isNaN)) {
					return e('p', t`⚠ 输入里有 ${e('code', 'NaN')}`);
				}
				const [top, bottom, left, right, scale, displayScale] = clips;
				if (left + right > bitmap.width) {
					return e('p', '⚠ 左右两侧裁剪长度之和大于图像宽度');
				}
				if (top + bottom > bitmap.height) {
					return e('p', '⚠ 上下两侧裁剪长度之和大于图像高度');
				}
				const width = bitmap.width - (left + right);
				const height = bitmap.height - (top + bottom);
				const targetWidth = Math.round(width * scale);
				const targetHeight = Math.round(height * scale);
				if (Math.min(targetWidth, targetHeight) === 0) {
					return e('p', '⚠ 图像大小为 0');
				}
				if (targetWidth * targetHeight > 10 ** 6) {
					return e('p', `⚠ 图像太大了${showSize({ height: targetHeight, width: targetWidth })}`);
				}
				canvas.width = targetWidth;
				canvas.height = targetHeight;
				canvas.style.width = `${targetWidth * displayScale}px`;
				canvas.style.height = `${targetHeight * displayScale}px`;
				ctx.drawImage(bitmap, left, top, width, height, 0, 0, targetWidth, targetHeight);
				return [e('p', `✓${showSize({ height: targetHeight, width: targetWidth })}`), displayer];
			});
		});
	const [cTop, cBottom, cLeft, cRight, cScale, cSize] = inputs.map(input => input.element);
	return e('details', { class: container, open: true },
		e('summary', { style: 'margin-block:0;' }, file.name),
		e('h4', '裁剪'),
		cTop, cBottom, cLeft, cRight,
		e('h4', '缩放'),
		cScale,
		e('h4', '显示'),
		cSize,
		loading(promise),
	);
}

/**
 * @type {import('../router/index.js').Handler}
 */
function main(_context) {
	const input = e('input', {
		type: 'file',
		multiple: true,
		accept: 'image/*',
	});
	const box = map(valueBox(input), _ => Array.from(/**@type {FileList}*/(input.files)));
	return {
		head: [
			e('title', '测试'),
		],
		body: e('article', { class: container },
			e('h1', t`${link('/', 'LMOliver')}/test`),
			computed($ => $(box).length !== 0
				? computed($ => $(box).map(processor))
				: e('p', input)
			)
		),
	};
}

export const imagePreprocess = router([
	['/', main],
]);