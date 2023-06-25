import { Request } from "express";

export interface AccessToken {
	type: "access";
	code: string;
	userId: number;
	expireAt: Date;
}

export interface RefreshToken {
	type: "refresh";
	code: string;
	userId: number;
	expireAt: Date;
}

export interface sessionCookie {
	type: "sesionCookie";
	userId: number;
	userName: string;
}

export type Token = RefreshToken | AccessToken;
export type RequestWithAccess = Request & { accessToken: Token };
export type RequestWithRefresh = Request & { refreshToken: Token };
export type RequestWithBothToken = Request & {
	refreshToken: Token;
	accessToken: Token;
};

export function instanceOfToken(object: any): object is Token {
	return (
		Object.prototype.hasOwnProperty.call(object, "type") &&
		Object.prototype.hasOwnProperty.call(object, "code") &&
		Object.prototype.hasOwnProperty.call(object, "userId") &&
		Object.prototype.hasOwnProperty.call(object, "expireAt") &&
		(object.type == "refresh" || object.type == "access")
	);
}
