import { element as e } from '../dynamic-dom/index.js';
import { container } from './container.css.js';

/**
 * @param {import('../dynamic-dom/types.js').Supported} slot
 * @param {import('../channel/channel.js').Callback<File>} callback
 * @param {import("../dynamic-dom/types.js").Attri<string>} inputAttr
 */
export function fileUploader(slot, inputAttr, callback) {
	const fileInput = e('input', {
		type: 'file',
		style: 'opacity:0;width:0;',
		...inputAttr,
	});
	fileInput.addEventListener('input', () => {
		if (fileInput.files) {
			for (const file of fileInput.files) {
				callback(file);
			}
		}
	});
	const element = e('label', {
		class: container,
		style: 'display:flex;width:fit-content;justify-content:center;align-items:center;',
		$dragover: event => event.preventDefault(),
		$dragenter: event => event.preventDefault(),
		$drop: event => {
			if (event.dataTransfer) {
				for (const file of event.dataTransfer.files) {
					callback(file);
				}
			}
			event.preventDefault();
		},
	}, slot, fileInput);
	return element;
}