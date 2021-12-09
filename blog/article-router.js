import { router } from '../router/index.js';
import { articles } from './articles/info.js';
import { article as articleHandler } from './article-handler.js';

/**@type {()=>import('../router/index.js').Handler}*/
export function articleRouter() {
	return router(
		articles.map(article => ['/' + article.id, context => articleHandler(article, context)])
	);
}