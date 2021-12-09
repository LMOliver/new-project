import express, { Router } from 'express';
import { UserInputError } from '../ensure/index.js';
import { login } from './auth/index.js';

express()
	.use('/api',
		Router()
			.use('/login', login()),
		/**@type {import('express').ErrorRequestHandler} */
		(err, req, res, next) => {
			if (err instanceof UserInputError) {
				res.status(400).send(err.message).end();
			}
			else {
				res.sendStatus(500);
			}
		}
	)
	.listen(8000);