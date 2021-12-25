export type AuthState = {
	isLoginned: false;
} | {
	isLoginned: true;
	uid: string;
	name: string;
};
export type PaintToken = string;
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