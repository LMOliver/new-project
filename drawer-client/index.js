import { router } from '../router';
import { collectorClient } from './collector-client.js';
import { contributorClient } from './contributor-client.js';

/**@type {import('../router').Handler} */
export const drawClient = router([
	['/', collectorClient],
	['/contributor', contributorClient],
]);