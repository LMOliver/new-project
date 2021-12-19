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
export type TaskImage = {
	height: number;
	width: number;
	data: string;
};
export type Task = {
	image: TaskImage;
	options: {
		leftTop: { x: number, y: number; };
		weight: number;
	};
};