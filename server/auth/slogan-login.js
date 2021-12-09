import express from 'express';
import { ensure, UserInputError } from '../../ensure/index.js';
import { createHash } from 'crypto';
import { json } from 'body-parser';

/**
 * @template {string} T
 * @param {T} type
 * @param {RegExp} pattern
 * @param {(uid:string)=>Promise<string>} getSlogan
 * @returns {import('express').Handler}
 */
export function sloganLogin(type, pattern, getSlogan) {
	const ensureUIDString = ensure({ type: 'string', pattern });
	const ensureInput = ensure({
		type: 'object',
		entires: {
			data: { type: 'string', pattern: /^[0-9A-Za-z]{1,128}$/ },
			digest: { type: 'string', pattern: /^[0-9a-f]{1,128}$/ },
		}
	});
	const router = express.Router();
	router.post('/:uid', json(), async (req, res, next) => {
		try {
			const { data, digest } = ensureInput(req.body);
			const correctDigest = createHash('sha256').update(data).digest().toString('hex');
			if (digest !== correctDigest) {
				throw new UserInputError('输入的哈希值有误');
			}
			const uid = ensureUIDString(req.params.uid);
			const slogan = await getSlogan(uid);
			if (slogan !== correctDigest) {
				throw new UserInputError('用户签名与输入的哈希值不同');
			}
			res.status(200).send(slogan).end();
		}
		catch (error) {
			next(error);
		}
	});
	return router;
}