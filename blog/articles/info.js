/**
@typedef {{
	id:string;
	title:string;
	description:string;
	time:Date;
	tags:string[];
}} Article
 */
/**@type {Article[]} */
export const articles = [
	// {
	// 	id: 'tale-of-Gei',
	// 	title: '给史瞎编',
	// 	description: '祝你们好运。',
	// 	time: new Date('2021-11-18 20:55'),
	// 	tags: ['tale', 'doujin'],
	// },
	{
		id: 'LGR097',
		title: '洛谷 11 月月赛 II & ✗✓OI Round 1 游记',
		description: '附有部分题解',
		time: new Date('2021-11-13 22:59'),
		tags: ['luogu', 'contest'],
	},
	{
		id: 'xYix-sokoban',
		title: 'x义x 推箱子',
		description: 'Flying2018：有趣的题',
		time: new Date('2021-11-11 22:25'),
		tags: ['purged'],
	},
	{
		id: 'about',
		title: '关于',
		description: '这是谁的博客？',
		time: new Date('2021-11-10 17:43'),
		tags: ['meta'],
	},
	{
		id: 'ZJOI2019',
		title: 'ZJOI2019 游记',
		description: 'LMOliver 的省选爆零记',
		time: new Date('2019-3-27 20:36'),
		tags: ['official', 'contest', 'old'],
	},
];

/**
@typedef {{
	id:string;
	name?:string;
	showTag?:boolean;
}} Tag
 */

/**
 * @type {Tag[]}
 */
export const tags = [
	{ id: 'old', name: '旧文' },
	{ id: 'contest', name: '比赛' },
	{ id: 'construction', name: '构造' },
	{ id: 'meta', showTag: false },
	{ id: 'purged', name: '数据删除' },
	{ id: 'official', name: '正式' },
	{ id: 'luogu', name: '洛谷' },
	{ id: 'tale', name: '故事' },
	{ id: 'doujin', name: '同人' },
];

const tagMap = new Map(tags.map(tag => [tag.id, tag]));
/**@param {string} id @returns {Tag}*/
export function getTag(id) {
	return tagMap.get(id) || { id, name: id };
}