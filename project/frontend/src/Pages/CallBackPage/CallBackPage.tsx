import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookie from "js-cookie";
import { addDays } from "date-fns";

//! //BUG les redirect marche pas
//TODO demander pour le retour et le fait de gere dans la fonction qui apele

async function getToken(): Promise<void> {
	if (Cookie.get("token")) {
		console.log("token already exist");
		// TODO verifier le token avec le back si il a de la merde tu le degage
		return;
	}

	let url = new URL(window.location.href);
	let params = {
		code: url.searchParams.get("code"),
	};

	if (!params.code) throw new Error("no code");

	try {
		const response = await axios.post(
			`${process.env.REACT_APP_BACK_URL}/oauth`,
			params
		);
		const expire = addDays(new Date(), 10);
		document.cookie = `token=${
			response.data.token
		}; expires=${expire.toString()}; path=/`;
		return;
	} catch (e) {
		if (axios.isAxiosError(e))
			throw new Error("request failed with the error " + e.status);
		throw new Error("request failed for unknown reason");
	}
}

export default function CallBackPage() {
	const navigate = useNavigate();
	console.log("render ou rerender de la page de callback");
	useEffect(() => {
		getToken()
			.then(() => {
				navigate("/home");
			})
			.catch((e) => {
				console.error(e);
				navigate("/");
			});
	}, [navigate]);
	return <div>Callback Page</div>;
}
