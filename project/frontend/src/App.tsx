import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
// import { SocketProvider } from './Component/Pong/PongSocketContext';
import Layout from './Pages/Layout/Layout';
import Home from './Pages/Home/Home';
import Game from './Pages/Game/Game';
import Chat from './Pages/Chat/Chat';
import Setting from './Pages/Setting/Setting';
import NoMatch from './Pages/404';
import LogGuard from './conditionalRender';
import BrutForce from './Pages/BrutForce/BrutForce';
import PongOnline from './Component/Pong/PongOnline';
import PongSolo from './Component/Pong/PongSolo';
import './index.css';
import CallBackPage from "./Pages/CallBackPage/CallBackPage";
import { ToastContainer } from "react-toastify";
import Profile from './Pages/profile/profile';
import FriendPart from './Pages/Home/friendPart/FriendPart';
import LeaderPart from './Pages/Home/LeaderPart/LeaderPart';

import './App.css';
import ProfilePart from './Pages/Home/profilePart/ProfilePart';
import { getAccessContent } from './utils/ApiClient';

const dark = createTheme({
	palette: {
		mode: 'dark',
		primary: {
		  main: '#5161b7',
		},
		secondary: {
		  main: '#f50057',
		},
		background: {
			default: '#2f2e2e',
			paper: '#40434c',
		  },
	  },
});

const light = createTheme({
	palette: {
		mode: 'light',
		primary: {
		  main: '#d50000',
		},
		secondary: {
		  main: '#f50057',
		},
		background: {
		  default: '#353434',
		  paper: '#4c4340',
		},
		text: {
		  primary: '#ffebee',
		},
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
					<Route path="/force" element={<BrutForce />} />
					<Route path="/callback" element={<CallBackPage />} />
					<Route path="/" element={<LogGuard />}>
						<Route path="/" element={<Layout handleTheme={handleTheme} />} >
							<Route index element={<Home />} />
							<Route path="/profile/:userId" element={<Profile />} />
							<Route path="/friend" element={<FriendPart />} />
							<Route path="/leader" element={<LeaderPart />} />
							<Route path="game" element={<Game />} />
							<Route path="game/pong-online" element={<PongOnline />} />
							<Route path="game/pong-solo" element={<PongSolo location={location} />} />
							<Route path="chat" element={<Chat />} />
							<Route path="setting" element={<Setting />} />
							<Route path="*" element={<NoMatch />} />
						</Route>
					</Route>
				</Routes>
				<ToastContainer pauseOnFocusLoss={false} />
			</div>
		</ThemeProvider>
	);
}
