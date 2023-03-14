import Button from "@mui/material/Button";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";

import "./LogPage.css";
import "./Fleche.scss";
import "./stars.scss";

interface interfaceBodyApi {
	client_id: string;
	redirect_uri: string;
	response_type: string;
	scope?: string;
	state?: string;
}

function SignUpButton() {
	const Fetchkey = async () => {
		//!########################################################################
		//!	Recuperation du code pour pouvoir avoir le token d'acces dans le back #
		//!########################################################################
		const body42: interfaceBodyApi = {
			client_id: process.env.REACT_APP_API_KEYPUB!,
			redirect_uri: `${process.env.REACT_APP_FRONT_URL}/callback`,
			response_type: "code",
		};

		let pathApi: string = `${process.env.REACT_APP_API_AUTHORIZE}?client_id=${body42.client_id}&redirect_uri=${body42.redirect_uri}&response_type=${body42.response_type}`;
		console.log(pathApi);
		document.location = pathApi;
	};

	const handlerClick = () => {
		Fetchkey();
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

//? le scroller est fait en css
function ScrolLogPage() {
	let fleche = require("./assets/chevron.png");
	let ft_scroll_to_bottom = () => {document.getElementById("ScrollPart")!.scrollTo({ top: document.getElementById("ScrollPart")!.scrollHeight, behavior: "smooth" })};

	return (
		<div id="ScrollPart">
			<div id="upPage">
				<h1>TRANSANDANCE</h1>
				<img id="Fleche" src={fleche} alt="fleche" onClick={ft_scroll_to_bottom} />
			</div>
			<div id="downPage">
				<SignUpButton />
			</div>
		</div>
	);
}

//? le background est fait en scss
function BackgoudLogPage() {
	return (
		<div id="backgroudStars">
			<div id="stars"></div>
			<div id="stars2"></div>
			<div id="stars3"></div>
		</div>
	);
}

export default function LogPage() {
	return (
		<>
			<BackgoudLogPage />
			<ScrolLogPage />
		</>
	);
}
