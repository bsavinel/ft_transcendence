import Button from "@mui/material/Button";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";

import "./LoginPage.scss";
import "./Fleche.scss";
import "./stars.scss";
import {Navigate} from "react-router-dom";
import {getAccess} from "../../utils/ApiClient";

interface interfaceBodyApi {
	client_id: string;
	redirect_uri: string;
	response_type: string;
	scope?: string;
	state?: string;
}

function SignUpButton() {
	const handlerClick = () => {
		//!########################################################################
		//!	Recuperation du code pour pouvoir avoir le token d'acces dans le back #
		//!########################################################################
		const body42: interfaceBodyApi = {
			client_id: import.meta.env.VITE_API_KEYPUB,
			redirect_uri: `${import.meta.env.VITE_FRONT_URL}/callback`,
			response_type: "code",
		};

		let pathApi: string = `${
			import.meta.env.VITE_API42
		}/oauth/authorize?client_id=${body42.client_id}&redirect_uri=${
			body42.redirect_uri
		}&response_type=${body42.response_type}`;

		document.location = pathApi;
	};

	return (
		<Button
			variant="contained"
			size="large"
			endIcon={<RocketLaunchIcon />}
			onClick={handlerClick}
		>
			Sign Up
		</Button>
	);
}

export default function LoginPage() {
	// let fleche = require("../../assets/chevron.png");

	// let ft_scroll_to_bottom = () => {
	// 	document.getElementById("ScrollPart")!.scrollTo({
	// 		top: document.getElementById("ScrollPart")!.scrollHeight,
	// 		behavior: "smooth",
	// 	});
	// };
	return (
		<>
			<div id="backgroudStars">
				<div id="stars"></div>
				<div id="stars2"></div>
				<div id="stars3"></div>
			</div>
			<div id="ScrollPart">
				<div id="upPage">
					<h1>TRANSCENDENCE</h1>
					{/* <img
						id="Fleche"
						src={fleche}
						alt="fleche"
						onClick={ft_scroll_to_bottom}
					/> */}
					<SignUpButton />
				</div>
				{/* <div id="downPage">
				</div> */}
			</div>
		</>
	);
}
