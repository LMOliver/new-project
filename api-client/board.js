import { apiPath } from './apiPath.js';

export async function board() {
	const result = await fetch(apiPath('/drawer/board'));
	if (!result.ok) {
		return result.text()
			.catch(() => {
				throw new Error(`${result.status} ${result.statusText}`);
			})
			.then(message => {
				throw new Error(message);
			});
	}
	else {
		const data = await result.arrayBuffer();
		const [width, height] = new Uint32Array(data, 0, 2);
		return {
			width,
			height,
			data: new Uint8Array(data, 8, width * height),
		};
	}
}