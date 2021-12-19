import { tasks } from '../api/tasks.js';
import { container, inlineContainer } from '../components/container.css.js';
import { element as e } from '../dynamic-dom/index.js';
import { computed, useBox } from '../dynamic/dynamic.js';
import { showImage } from './showImage';
import { taskEditor } from './taskEditor.js';

/**
 * @param {number} weight
 */
function parseTaskWeight(weight) {
	const priority = Math.round(Math.log1p(weight) / Math.log(1e10));
	return {
		priority,
		weight: Math.round(weight / (1e10 ** Number(priority))),
	};
}

/**
 * @param {import('../api/api.js').Task&{id:string}} task 
 * @returns {import('../dynamic-dom/types.js').Supported}
 */
function showTask(task) {
	const [isEditing, set] = useBox(false);
	return computed($ => {
		if ($(isEditing)) {
			return e('article', { class: container },
				taskEditor(task.image, task, _ => {
					set(false);
				}).element,
			);
		}
		else {
			const { priority, weight } = parseTaskWeight(task.options.weight);
			return e('article', { class: inlineContainer, style: 'display:flex;flex-direction:row;gap:0.5em' },
				e('div', showImage(task.image)),
				e('div',
					e('p', { style: 'margin-block-start:0;' },
						`${task.image.width}×${task.image.height}（${task.image.width * task.image.height} 像素）`,
					),
					e('p',
						`左上角：(${task.options.leftTop.x},${task.options.leftTop.y}) 优先级：${priority} 权重：${weight}`,
					),
					e('p', { style: 'margin-block-end:0;' },
						e('button', { $click: () => set(true) }, '编辑'),
					)
				),
			);
		}
	});
}

/**
 * @param {(import("../api/api.js").Task&{id:string})[]} list
 */
function showList(list) {
	return e('ul', { style: 'list-style-type:none;padding-left:0;' },
		list.map(task => e('li', { style: 'margin-block:1em;' }, showTask(task))),
	);
}

export function taskList() {
	return [
		e('details',
			e('summary', '任务列表'),
			computed($ => {
				return showList($(tasks()));
			})
		),
	];
}