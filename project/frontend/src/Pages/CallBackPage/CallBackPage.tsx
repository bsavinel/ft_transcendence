import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { setAccess } from "../../utils/ApiClient";

async function internAuthentification(): Promise<boolean> {
	let url = new URL(window.location.href);
	let params = {
		code: url.searchParams.get("code"),
	};
	if (!params.code) throw new Error("no code");

	const response = await axios.post<{
		refreshToken: string;
		accessToken: string;
		newUser: boolean;
	}>(`${import.meta.env.VITE_BACK_URL}/oauth/singin`, params,{withCredentials: true} );

	console.log("data : ", response.data);
	setAccess(response.data.accessToken);
	return response.data.newUser;
}

export default function CallBackPage() {
	const navigate = useNavigate();

	useEffect(() => {
		internAuthentification()
			.then((newUser: boolean) => {
				newUser ? navigate("/profile") : navigate("/home");
				navigate("/home");
			})
			.catch((e) => {
				console.error(e);
				navigate("/");
			});
	}, [navigate]);
	return <div>Callback Page</div>;
}
