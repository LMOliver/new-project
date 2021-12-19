import { addTask, updateTask, updateTasks } from '../api/tasks.js';
import { loading } from '../components/loading.js';
import { element as e, valueBox } from '../dynamic-dom/index.js';
import { computed, map, unbox, useBox } from '../dynamic/dynamic.js';
import { boardDisplayer } from './board.js';
import { HEIGHT, WIDTH } from './constants.js';
import { showImage } from './showImage.js';
import { limitInRange } from './task-upload';
// @ts-ignore
import { previewImage } from './taskEditorImagePreview.module.css';

/**
 * @param {import('../api/api.js').TaskImage} image
 * @param {(import('../api/api.js').Task&{id:string})|null} task
 * @param {import('../channel/channel.js').Callback<boolean>} done
 */
export function taskEditor(image, task, done) {
	const left = e('input', {
		type: 'number', required: true, min: 0, max: WIDTH - image.width, step: 1,
		value: task ? task.options.leftTop.x : '',
	});
	const cL = (/** @type {string} */ x) => limitInRange(Math.round(Number(x)), 0, WIDTH - image.width);
	left.addEventListener('change', () => {
		const result = cL(left.value);
		if (result !== Number(left.value)) {
			left.value = result.toString();
		}
	});
	const lB = map(valueBox(left), cL);

	const top = e('input', {
		type: 'number', required: true, min: 0, max: HEIGHT - image.height, step: 1,
		value: task ? task.options.leftTop.y : '',
	});
	const cT = (/** @type {string} */ x) => limitInRange(Math.round(Number(x)), 0, HEIGHT - image.height);
	top.addEventListener('change', () => {
		const result = cT(top.value);
		if (result !== Number(top.value)) {
			top.value = result.toString();
		}
	});
	const tB = map(valueBox(top), cT);

	const priorityInput = e('input', {
		type: 'number', required: true, min: 0, max: 10, step: 1,
		value: task ? Math.round(Math.log1p(task.options.weight) / Math.log(1e10)) : 5,
	});
	const weightInput = e('input', {
		type: 'number', required: true, min: 0, max: 1000, step: 1,
		value: task ? Math.round(task.options.weight / (1e10 ** Number(priorityInput.value))) : 100,
	});

	async function upload() {
		const leftTop = { x: unbox(lB), y: unbox(tB) };
		const weight = Number(weightInput.value) * 1e10 ** Number(priorityInput.value);
		const options = { leftTop, weight };
		if (task === null) {
			await addTask({ image, options });
		}
		else {
			await updateTask({ id: task.id, options });
		}
	}

	const [hint, setHint] = useBox(/**@type {import('../dynamic-dom/types.js').Supported} */([]));
	const form = e('form',
		e('p', e('label', '横坐标', left)),
		e('p', e('label', '纵坐标', top)),
		e('p', e('label', '优先级', priorityInput), ' ', e('label', '权重', weightInput)),
		e('p',
			e('input', {
				type: 'submit',
				$click: event => {
					event.preventDefault();
					if (form.reportValidity()) {
						setHint(loading(
							upload().then(() => {
								updateTasks();
								done(true);
								return [];
							}),
							() => '上传中……',
							error => e('span', { style: 'color:red;' }, error.message || error.toString())
						));
					}
				},
				value: '提交',
			}),
			e('button', { $click: () => done(false) }, '取消'),
			hint
		)
	);
	return {
		element: [
			e('div', { style: 'position:relative;' },
				boardDisplayer(),
				e('div', {
					class: previewImage,
					style: computed($ => `position:absolute;left:${$(lB)}px;top:${$(tB)}px;`),
				}, showImage(image))
			),
			form,
		],
		focus: () => left.focus(),
	};
}
