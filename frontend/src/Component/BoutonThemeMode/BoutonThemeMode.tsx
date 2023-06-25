import { useState, useRef, useEffect } from "react";
import { DarkModeOutlined, LightModeOutlined } from "@mui/icons-material";
import "./bouton.scss";

interface BoutonThemeModeProps {
    handleTheme: () => void;
	isLightTheme: boolean;
}

export default function BoutonThemeMode({handleTheme, isLightTheme}: BoutonThemeModeProps) {
	const isInitial = useRef(true)

	useEffect(() => {
	  isInitial.current = false
	}, [])

	return (
		<>
			<button className="modeButton" onClick={handleTheme}>
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
