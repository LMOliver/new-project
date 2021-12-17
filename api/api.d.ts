export type AuthState = {
	isLoginned: false;
} | {
	isLoginned: true;
	uid: string;
};
export type PaintToken = {
	uid: string;
	clientID: string;
};