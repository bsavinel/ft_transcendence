import { useState } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import Layout from './Pages/Layout/Layout';
import Home from './Pages/Home/Home';
import Game from './Pages/Game/Game';
import Chat from './Pages/Chat/Chat';
import Setting from './Pages/Setting/Setting';
import CallBackPage from './Pages/CallBackPage/CallBackPage';
import NoMatch from './Pages/404';
import TestPage from './Pages/Test/TestPage';
import LogGuard from './conditionalRender';
import BrutForce from './Pages/BrutForce/BrutForce';

import './index.css';

const dark = createTheme({
	palette: {
		mode: 'dark',
		primary: {
			main: '#42566a',
		},
		secondary: {
			main: '#877861',
		},
		background: {
			default: '#212f3d',
			paper: '#516a81',
		},
	},
	shape: {
		borderRadius: 4,
	},
});

const light = createTheme({
	palette: {
		mode: 'light',
		primary: {
			main: '#768ca3',
		},
		secondary: {
			main: '#877861',
		},
		background: {
			default: '#FDEDEC',
			paper: '#516a81',
		},
	},
	shape: {
		borderRadius: 4,
	},
});

export default function App() {
	const [theme, setTheme] = useState(dark);

	function handleTheme() {
		if (theme === dark) setTheme(light);
		else setTheme(dark);
	}

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<div className="app">
				<Routes>
					<Route path="/test" element={<TestPage />} />
					<Route path="/force" element={<BrutForce />} />
					<Route path="/callback" element={<CallBackPage />} />
					<Route path="/" element={<LogGuard />}>
						<Route path="/" element={<Layout handleTheme={handleTheme}/>}>
							<Route index element={<Home />} />
							<Route path="game/*" element={<Game />} />
							<Route path="chat" element={<Chat />} />
							<Route
								path="setting"
								element={<Setting  />}
							/>
							<Route path="*" element={<NoMatch />} />
						</Route>
					</Route>
				</Routes>
			</div>
		</ThemeProvider>
	);
}
