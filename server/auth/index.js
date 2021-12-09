import express from 'express';
import { luoguLogin } from './luogu.js';

/**
 * @returns {import('express').Handler}
 */
export function login() {
	const router = express.Router();
	router.use('/luogu', luoguLogin());
	return router;
}

/**
 * @returns {import('express').Handler}
 */
export function auth() {
	return (req, res, next) => {
		try {
			if () {
				res.locals.user = 
			}
		}
		catch (e) {
			
		}
	};
}

/**
 * @returns {import('express').Handler}
 */
export function requireAuth() {
	return (req, res, next) => {
		if (!res.locals.user) {
			res.sendStatus(401);
		}
	};
}