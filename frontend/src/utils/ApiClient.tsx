import axios from 'axios';
import { addSeconds } from 'date-fns';
import jwt_decode from 'jwt-decode';

export interface AccessToken {
	type: 'access';
	code: string;
	userId: number;
	expireAt: Date;
}

var access: string | undefined;
var accessContent: AccessToken | undefined;
var ApiClient = axios.create({ baseURL: `${import.meta.env.VITE_BACK_URL}` });

async function refreshAccessToken(): Promise<void> {
	try {
		const response = await axios.get<{
			accessToken: string;
		}>(`${import.meta.env.VITE_BACK_URL}/oauth/refresh`, {
			withCredentials: true,
		});

		access = response.data.accessToken;
		accessContent = jwt_decode(access);
	} catch (e) {
		if (axios.isAxiosError(e)) {
			console.log('axios error :', e.request.status);
			console.log(e.response?.data.message);
		}
	}
}

export function setAccess(newAccess: string): void {
	access = newAccess;
	accessContent = jwt_decode(access);
}

export function getAccess(): string | undefined {
	return access;
}

export function getAccessContent(): AccessToken | undefined {
	return accessContent;
}

ApiClient.interceptors.request.use(async (config) => {
	if (
		!access ||
		!accessContent ||
		accessContent.expireAt >= addSeconds(new Date(), 40)
	)
		await refreshAccessToken();
	config.headers["Authorization"] = "Bearer " + access;
	return config;
});

export default ApiClient;
