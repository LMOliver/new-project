import { container } from '../components/container.css.js';
import { fileUploader } from '../components/file-uploader.js';
import { element as e, template as t } from '../dynamic-dom/index.js';
import { computed, useBox } from '../dynamic/dynamic.js';
import { HEIGHT, WIDTH } from './constants.js';
import { quantize } from './image-quantize.js';
import { taskEditor } from './taskEditor.js';

export const limitInRange = (/** @type {number} */ x, /** @type {number} */ l, /** @type {number} */ r) => Math.max(Math.min(x, r), l);

export function taskUploader() {
	const [editingTaskImage, set] = useBox(/**@type {import('../api-client/api.js').TaskImage|null}*/(null));
	const [hint, setHint] = useBox(/**@type {import('../dynamic-dom/types.js').Supported}*/([]));
	return [
		hint,
		computed($ => {
			const image = $(editingTaskImage);
			if (image !== null) {
				const { element, focus } = taskEditor(image, null, (/** @type {any} */ isSubmitted) => {
					set(null);
					if (isSubmitted) {
						setHint(e('p', { style: 'color:green;' }, '提交成功！'));
					}
					else {
						setHint([]);
					}
				});
				requestAnimationFrame(focus);
				return e('div', { class: container }, element);
			}
			else {
				return [
					fileUploader('点我上传图片', { accept: 'image/*' }, async file => {
						const bitmap = await createImageBitmap(file);
						const { width, height } = bitmap;
						if (width >= WIDTH || height >= HEIGHT) {
							setHint(e('p', { style: 'color:red;' }, `图像太大了（${width}×${height}）`));
						}
						else {
							const canvas = e('canvas', { width, height });
							const ctx = canvas.getContext('2d');
							if (ctx === null) {
								throw new Error();
							}
							ctx.drawImage(bitmap, 0, 0);
							const imageData = ctx.getImageData(0, 0, width, height);
							quantize(imageData).then(result => {
								setHint([]);
								set(result);
							});
							// console.log(taskImage);
						}
					}),
					e('p', { style: 'margin-bottom:0;' },
						t`建议您新增任务前先使用画图或 ${e('a', { href: 'https://www.gimp.org/' }, 'GIMP')} 等程序对图像进行预处理。`
					),
				];
			}
		}),
	];
}