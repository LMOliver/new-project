import { container } from '../components/container.css.js';
import { loading } from '../components/loading.js';
import { element as e, template as t, valueBox } from '../dynamic-dom/index.js';
import { computed, makeSequenceDirty, map, Sequence, SequenceChangeType, useSequence, useSequenceDirty } from '../dynamic/dynamic.js';
import { convertImage } from '../image-preprocessing/convert.js';

/**
 * @param {{ name: string; data: ImageBitmap; }} image
 * @param {import('../dynamic-dom/types.js').Supported} slot
 * @returns {import('../dynamic-dom/types.js').Supported}
 */
function processor(image, slot) {
	/**
	 * @param {import("../image-preprocessing/convert.js").ConvertOptions} convertConfig
	 */
	async function qwq(convertConfig) {
		const converted = await convertImage(image.data, convertConfig);
		const canvas = e('canvas', {
			width: converted.width,
			height: converted.height,
			style: 'display:block;padding:0;image-rendering:pixelated;box-shadow:0px 0px 2px 1px gray;'
		});
		const ctx = canvas.getContext('2d');
		if (!ctx) {
			throw new Error('canvas is not supported');
		}
		ctx.putImageData(converted, 0, 0);
		return { converted, canvas };
	}

	const options = [
		{ name: '上', step: 1, initial: 0 },
		{ name: '下', step: 1, initial: 0 },
		{ name: '左', step: 1, initial: 0 },
		{ name: '右', step: 1, initial: 0 },
		{ name: '缩放', step: 0.1, initial: 1 },
	];
	const inputs = options.map(({ name, step, initial }) => {
		const input = e('input', { type: 'number', min: 0, name, step, value: initial });
		return {
			element: e('div', e('label', name, input)),
			box: valueBox(input),
		};
	});
	const inputBoxes = inputs.map(input => input.box);

	const config = computed($ => {
		const [top, bottom, left, right, scale] = inputBoxes.map($).map(Number);
		return {
			clip: { top, bottom, left, right },
			resize: { scale },
		};
	});

	const result = map(config, qwq);

	const shortHint = map(result, result => loading(
		result.then(x => x.converted).then(x => `${x.width}×${x.height}`),
		() => `转换中`,
		error => e('span', { style: 'color:red;' }, `转换出错：${error.message}`),
		5
	));
	const resultCanvas = map(result, result => loading(result.then(x => x.canvas), () => '转换中……'));

	return e('details', { open: true, class: container },
		e('summary', t`${image.name}（${shortHint}）`),
		inputs.map(input => input.element),
		resultCanvas,
		slot,
	);
}

export function imageList() {
	const input = e('input', {
		type: 'file',
		multiple: true,
		accept: 'image/*',
		style: 'opacity:0;width:0;',
	});
	const [images, changeImages] = useSequence(/**@type {{name:string;data:ImageBitmap}[]}*/([]));
	/**
	 * @param {File} file
	 */
	async function addFile(file) {
		const bitmap = await createImageBitmap(file);
		const result = {
			name: file.name,
			data: bitmap,
		};
		const index = images.current.findIndex(item => /*item.name === file.name*/false);
		if (index !== -1) {
			changeImages([SequenceChangeType.set, index, result]);
		}
		else {
			changeImages([SequenceChangeType.insert, images.current.length, result]);
		}
	}
	input.addEventListener('input', () => {
		for (const file of Array.from(input.files || [])) {
			addFile(file);
		}
	});
	return e('div',
		e('ul', { style: 'padding-left:0;' }, map(images, image => {
			return e('li', { style: 'list-style-type:none;margin-block:1em;' },
				processor(image,
					e('button', {
						$click: () => {
							const index = images.current.findIndex(item => item.name === image.name);
							changeImages([SequenceChangeType.delete, index, null]);
						}
					}, '删除'),
				),
			);
		})),
		e('label', {
			class: container,
			style: 'display:flex;height:200px;justify-content:center;align-items:center;',
			$dragover: event => event.preventDefault(),
			$dragenter: event => event.preventDefault(),
			$drop: event => {
				for (const file of (event.dataTransfer || { files: [] }).files) {
					addFile(file);
				}
				event.preventDefault();
			},
		}, '将图像拖至此处或点击此处以增加图像', input),
	);
}