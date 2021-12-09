import { sample } from '../utils';
import { getDPairHitokoto } from './dpair.js';
import { getXYiXHitokoto } from './xyix.js';
import { getYiYanHitokoto } from './yiyan.js';
/**
@typedef {{
	message: string;
	from?: string;
	source?: {
		description: string;
		href?: string;
	};
}} Hitokoto
 */

const getters = [
	getXYiXHitokoto,
	getYiYanHitokoto,
	getDPairHitokoto,
];

/**
 * @returns {Promise<Hitokoto>}
 */
export async function getHitokoto() {
	return sample(getters)();
}