import { flat, map, unbox } from '../dynamic/dynamic.js';
import { JSONRequest, localStorageHelper } from '../utils/index.js';
import { apiPath } from './apiPath.js';
import { authState } from './auth.js';

/**
 * @param {import("./api.js").AuthState} _state
 * @returns {Promise<(import('./api.js').Task&{id:string})[]>}
 */
function getTasks(_state) {
	return JSONRequest(apiPath('/drawer/tasks'), 'GET');
}

/**
 * @param {import('./api.js').Task} task 
 * @returns {Promise<void>}
 */
export function addTask(task) {
	return JSONRequest(apiPath('/drawer/tasks'), 'POST', task);
}
/**
 * @param {{id:string,options:import('./api.js').Task['options']}} update
 * @returns {Promise<void>}
 */
export function updateTask({ id, options }) {
	return JSONRequest(apiPath(`/drawer/task/${id}`), 'POST', { options });
}

/**
 * @param {string} id 
 * @returns {Promise<void>}
 */
export function deleteTasks(id) {
	return JSONRequest(apiPath(`/drawer/task/${id}`), 'DELETE');
}

const createTasksHelper = (/** @type {import("./api.js").AuthState} */ state) => {
	const getter = (/** @type {import('./api.js').Task[]} */ _) => getTasks(state);
	const helper = localStorageHelper('tasks', getter, []);
	return helper;
};

const qwqTasks = map(authState, createTasksHelper);

const _tasks = flat(map(qwqTasks, x => x.box));
export function updateTasks() {
	return unbox(qwqTasks).update();
}

let lazy = true;
export function tasks() {
	if (lazy) {
		lazy = false;
		updateTasks();
	}
	return _tasks;
}