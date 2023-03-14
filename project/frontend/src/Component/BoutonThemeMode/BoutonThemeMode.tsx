import { useState, useRef, useEffect } from "react";
import { DarkModeOutlined, LightModeOutlined } from "@mui/icons-material";
import "./bouton.scss";

interface BoutonThemeModeProps {
    handleTheme: () => void;
}

export default function BoutonThemeMode({handleTheme}: BoutonThemeModeProps) {
	// TODO passer le mode par redux
	const [isLightTheme, setTheme] = useState(true);
	const isInitial = useRef(true)

	useEffect(() => {
	  isInitial.current = false
	}, [])

	function handleClick() {
		setTheme(!isLightTheme);
        handleTheme();
	}

	return (
		<>
			<button className="modeButton" onClick={handleClick}>
				<div
					id={isLightTheme ? "activeThemeIcon" : "inactiveThemeIcon"}
					style={isInitial.current ? {animationDuration: "0ms"} : {animationDuration: "400ms"}}
				>
					<LightModeOutlined />
				</div>
				<div
					id={isLightTheme ? "inactiveThemeIcon" : "activeThemeIcon"}
					style={isInitial.current ? {animationDuration: "0ms"} : {animationDuration: "400ms"}}
				>
					<DarkModeOutlined />
				</div>
			</button>
		</>
	);
}
