import MarkdownIt from 'markdown-it';
import markdownKaTeX from '@iktakahiro/markdown-it-katex';

const mdit = new MarkdownIt({ html: true });
mdit.use(markdownKaTeX, { output: 'html', throwOnError: false });
/**
 * @param {string} markdown
 */
export function blogArticleRender(markdown) {
	return mdit.render(markdown);
}