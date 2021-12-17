import { getMyTokens } from '../api/tokens.js';
import { empty } from '../channel/channel.js';
import { useStorage } from '../components/storage.js';
import { component } from '../dynamic-dom/component';
import { bindChildren, deepTransform, element as e } from '../dynamic-dom/index.js';
import { computed, map, Sequence, SequenceChangeType, useBox, useSequenceDirty } from '../dynamic/dynamic.js';
import { wrap } from '../dynamic/utils.js';

const CLOSED = 0;
const CONNECTING = 1;
const OPEN = 2;
const CLOSING = 3;

export const tokenList = component('drawer-token-list',
	class TokenList extends HTMLElement {
		constructor() {
			super();
			this.state = CLOSED;
			/**@type {import('../channel/channel.js').Callback<void>} */
			this.close = () => { };
			this.wantToConnect = false;

			const messageHook = useBox('');
			this.message = messageHook[0];
			this.setMessage = messageHook[1];

			this.serverHook = useBox(
				/**@type {Sequence<import('../api/tokens.js').TokenInfo>|null}*/(null)
			);

			const storageHook = useStorage(localStorage, 'token-list');
			this.list = map(storageHook[0], x => {
				if (x === null) {
					return [];
				}
				try {
					return /** @type {import('../api/tokens.js').TokenInfo[]} */(JSON.parse(x));
				}
				catch (error) {
					console.error(error);
					return [];
				}
			});
			this.setList = (/** @type {import('../api/tokens.js').TokenInfo[]} */ x) => storageHook[1](JSON.stringify(x));

			const finalList = computed($ => {
				return $(this.serverHook[0]) || new Sequence($(this.list), empty);
			});

			const shadow = this.attachShadow({ mode: 'open' });
			bindChildren(shadow, deepTransform([
				e('p', this.message),
				e('table',
					e('thead',
						e('th',
							e('td', 'uid'),
							e('td', 'status'),
						),
					),
					e('tbody',
						map(finalList, x => map(x, x =>
							e('tr',
								e('td', x.owner),
								e('td', {
									style: `color:${{
										unknown: 'black',
										invalid: 'red',
										busy: 'orange',
										working: 'green',
									}[x.status]};`
								},
									x.status,
								)
							),
						)),
					),
				)
			]));
		}
		connect() {
			console.log('connect called, connecting...');
			this.state = CONNECTING;
			getMyTokens()
				.then(([list, closePromise, close]) => {
					console.log('opened!');
					this.state = OPEN;
					this.setMessage('');
					closePromise.then(() => {
						console.log('closed!');
						this.state = CLOSED;
						this.serverHook[1](null);
						this.afterClosed();
					});
					if (this.wantToConnect) {
						this.serverHook[1](list);
						this.setList(list.current.slice());
						wrap(list).changes(_ => {
							this.setList(list.current.slice());
						});
						this.close = close;
					}
					else {
						console.log('want to close, closing...');
						this.state = CLOSING;
						close();
					}
				})
				.catch(error => {
					this.state = CLOSED;
					this.serverHook[1](null);
					console.log('error while connecting: %o', error);
					this.setMessage(error.message || '无法连接');
					this.afterClosed();
				});
		}
		afterClosed() {
			if (this.wantToConnect) {
				this.connect();
			}
		}
		connectedCallback() {
			this.wantToConnect = true;
			if (this.state === CLOSED) {
				this.connect();
			}
		}
		disconnectedCallback() {
			this.wantToConnect = false;
			if (this.state === OPEN) {
				this.state = CLOSING;
				console.log('disconnected, closing...');
				this.close();
			}
		}
	}
);