import './global.css';
import { path } from '../components/path.js';
import { bindChildren, deepTransform, element as e } from '../dynamic-dom/index.js';
import { computed } from '../dynamic/computed.js';
import { router } from '../router/index.js';
import { homepage } from '../homepage/homepage.js';
import { notfound } from './notfound/notfound.js';
import { blog } from '../blog';
import { prepandInHead } from '../router/middlewares.js';
import { fufa } from './fufa/index.js';
import { drawClient } from '../drawer-client/index.js';

export function main() {
	const mainRouter =
		prepandInHead(
			Array.from(document.head.querySelectorAll(':not(.temporary)')),
		)(
			router([
				// ['/', homepage],
				// ['/blog', blog],
				// ['/fufa/', fufa],
				['/draw', drawClient],
			])
		);
	const { head, body } = mainRouter({
		path: computed($ => ({
			routing: $(path),
			original: $(path),
			search: new URLSearchParams(location.search),
		})),
		fallback: notfound
	});
	bindChildren(document.head, deepTransform(head));
	bindChildren(document.body, deepTransform(body));
}

main();