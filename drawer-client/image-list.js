import { container } from '../components/container.css.js';
import { loading } from '../components/loading.js';
import { element as e, template as t, valueBox } from '../dynamic-dom/index.js';
import { computed, makeBoxDirty, map, SequenceChangeType, unbox, useSequence } from '../dynamic/dynamic.js';
import { convertImage } from './image-preprocessing/convert.js';

/**
 * @param {{ name: string; data: ImageBitmap; }} image
 * @param {import('../dynamic-dom/types.js').Supported} slot
 * @returns {import('../dynamic-dom/types.js').Supported}
 */
function processor(image, slot) {
	/**
	 * @param {import("./image-preprocessing/convert.js").ConvertOptions} convertConfig
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
		{ name: '上', step: 1, initial: 0, style: 'width:4em;' },
		{ name: '下', step: 1, initial: 0, style: 'width:4em;' },
		{ name: '左', step: 1, initial: 0, style: 'width:4em;' },
		{ name: '右', step: 1, initial: 0, style: 'width:4em;' },
		{ name: '宽', step: 1, placeholder: '自动', style: 'width:4em;' },
		{ name: '高', step: 1, placeholder: '自动', style: 'width:4em;' },
	];
	const inputs = options.map(({ name, step, initial = '', placeholder = false, style }) => {
		const input = e('input', {
			type: 'number',
			min: 0,
			name,
			step,
			value: initial,
			placeholder,
			style: style || false
		});
		return {
			element: e('label', name, input),
			box: valueBox(input),
		};
	});
	const inputBoxes = inputs.map(input => input.box);
	const inputElements = inputs.map(input => input.element);

	const form = e('form', (([cU, cD, cL, cR, sW, sH]) => [
		e('p', e('h4', '裁剪'), t`${cU} ${cD} ${cL} ${cR}`),
		e('p', e('h4', '缩放'), t`${sW} ${sH}`),
	])(inputElements));

	/**@type {import('../dynamic/dynamic.js').Box<Promise<import('./image-preprocessing/convert.js').ConvertOptions>>} */
	const config = computed(async $ => {
		const [top, bottom, left, right] = inputBoxes.slice(0, 4).map($).map(Number);
		const [width, height] = inputBoxes.slice(4, 6).map($).map(x => x === '' ? null : Number(x));

		if (!form.reportValidity()) {
			throw new Error('参数无效');
		}

		return {
			clip: { top, bottom, left, right },
			resize: { width, height },
		};
	});

	const result = map(config, config => config.then(qwq));

	const shortHint = map(result, result => loading(
		result.then(x => x.converted).then(x => `${x.width}×${x.height}`),
		() => `转换中`,
		error => e('span', { style: 'color:red;' }, `转换出错：${error.message}`),
		5
	));
	const resultCanvas = map(result, result => loading(result.then(x => x.canvas), () => '转换中……'));

	return e('details', { open: true, class: container },
		e('summary', t`${image.name}（${shortHint}）`),
		form,
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
					e('p',
						e('button', {
							$click: () => {
								const index = images.current.findIndex(item => item.name === image.name);
								changeImages([SequenceChangeType.delete, index, null]);
							}
						}, '删除'),
					),
				),
			);
		})),
		e('label', {
			class: container,
			style: 'display:inline-flex;justify-content:center;align-items:center;box-shadow: 0px 0px 2px 1px gray;padding:0.5em',
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