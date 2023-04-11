import axios from "axios";
import Cookie from "js-cookie";
import { addDays } from "date-fns";
import Button from "@mui/material/Button";
import backClient, { getAccess, getAccessContent } from "../../utils/ApiClient";

function setCookieInWindow(value: string): void {
	const expire = addDays(new Date(), 10);
	document.cookie = `refreshToken=${value}; expires=${expire.toString()}; path=/`;
}

async function FetchAction(): Promise<void> {
	try {
		console.log("send");
		const response = await axios.get<{
			accessToken: string;
		}>(`${import.meta.env.VITE_BACK_URL}/oauth/refresh`, {
			withCredentials: true,
		});
		console.log("access token : ", response.data.accessToken);
	} catch (e) {
		if (axios.isAxiosError(e)) {
			console.log("axios error :", e.request.status);
			console.log(e.response?.data.message);
		} else console.log("une erreur c'est produite et sa pue");
	}
}

async function testInstance(): Promise<void> {
	backClient.get("/token/test");
}

async function testFindById() {
	// backClient.get("/users/1");
	// backClient.get("/users/1?friend=true&channel=true");
	backClient.delete("users/1/deleteFriend?friendId=2");
	console.log(getAccessContent());
}

export default function TestPage() {
	console.log(getAccess());
	return (
		<>
			<div>Coucou, tu as pas a etre sur cette tu peut partir stp</div>
			<Button
				variant="contained"
				size="large"
				onClick={() => {
					FetchAction();
				}}
			>
				Refresh Token
			</Button>
			<Button
				variant="contained"
				size="large"
				onClick={() => {
					testInstance();
				}}
			>
				Test instance
			</Button>
			<Button
				variant="contained"
				size="large"
				onClick={() => {testFindById()}}
			>
				Test findById
			</Button>
		</>
	);
}
