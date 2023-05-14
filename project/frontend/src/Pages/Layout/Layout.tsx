import {useContext, useEffect, useState} from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import {ChatSocketContext} from '../../Component/Chat/ChatSocketContext';
import NavBar from '../../Component/NavBar/NavBar';
import {invitDTO} from '../../Component/Notification/NotificationList';
import NotificationList from "../../Component/Notification/NotificationList"
import showToast, {ChatInvite, ToastFriendRequest, GameInvite} from '../../Component/toast/toast';
import { getAccessContent } from '../../utils/ApiClient';

import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import VideogameAssetTwoToneIcon from '@mui/icons-material/VideogameAssetTwoTone';
import ChatTwoToneIcon from '@mui/icons-material/ChatTwoTone';
import LeaderboardTwoToneIcon from '@mui/icons-material/LeaderboardTwoTone';

import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import GroupIcon from '@mui/icons-material/Group';
import BoutonThemeMode from '../../Component/BoutonThemeMode/BoutonThemeMode';

import './Layout.css';
import './stars.scss';
import { PongSocketContext } from '../../Component/Pong/PongSocketContext';

interface LayoutProps {
	handleTheme: () => void;
}

export default function Layout({ handleTheme }: LayoutProps) {
	const socket = useContext(ChatSocketContext);
	const socketPong = useContext(PongSocketContext);
	const [invitChat, setInvitChat] = useState<boolean>(false);
	const [invitFriend, setInvitFriend] = useState<boolean>(false);
	const [invitGame, setInvitGame] = useState<boolean>(false);
	const [author, setAuthor] = useState<string>('');
	const [chanId, setChanId] = useState<number | undefined>(undefined);
	const [friendId, setFriendId] = useState<number | undefined>(undefined);
	
	const myId: number = getAccessContent()?.userId as number;
	const navigate = useNavigate();

	function ResponsiveAppBar() {
		function handleClickGame() {
			navigate('/game');
		}

		function handleClickChat() {
			navigate('/chat');
		}

		function handleClickSettings() {
			navigate('/setting');
		}

		function handleClickFriend() {
			navigate('/friend');
		}

		function handleClickLeader() {
			navigate('/leader');
		}

		return (
			<AppBar position="static" sx={{ backgroundColor: (theme) => theme.palette.primary.main}}>
				<Toolbar disableGutters sx={{ marginLeft: '50px' }}>
					<RocketLaunchIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
					<Typography
						variant="h6"
						noWrap
						component="a"
						href="/"
						sx={{
						mr: 2,
						display: { xs: 'none', md: 'flex' },
						fontFamily: 'monospace',
						fontWeight: 1000,
						letterSpacing: '.3rem',
						color: 'inherit',
						textDecoration: 'none',
						}}
					>
						Transcendence
					</Typography>
					<Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
						<Tooltip title="Open Game">
						<Button
							key='Game'
							onClick={handleClickGame}
							sx={{ my: 2, color: 'white', display: 'block', ml: 3 }}
						>
							<VideogameAssetTwoToneIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
						</Button>
						</Tooltip>
						<Tooltip title="Open Chat">
						<Button
							key='Chat'
							onClick={handleClickChat}
							sx={{ my: 2, color: 'white', display: 'block', ml: 1 }}
							>
							<ChatTwoToneIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
						</Button>
						</Tooltip>
						<Tooltip title="Open friend">
						<Button
							key='friend'
							onClick={handleClickFriend}
							sx={{ my: 2, color: 'white', display: 'block', ml: 1 }}
							>
							<GroupIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
						</Button>
						</Tooltip>
						<Tooltip title="Open leader">
						<Button
							key='leader'
							onClick={handleClickLeader}
							sx={{ my: 2, color: 'white', display: 'block', ml: 1 }}
							>
							<LeaderboardTwoToneIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
						</Button>
						</Tooltip>
					</Box>
					<Box sx={{ flexGrow: 0, marginRight: '10px' }}>
						<NotificationList />
					</Box>
					<Box sx={{ flexGrow: 0, marginRight: '20px' }}>
						<BoutonThemeMode handleTheme={handleTheme} />
					</Box>
					<Box sx={{ flexGrow: 0, marginRight: '30px' }}>
						<Tooltip title="Open settings">
						<IconButton  sx={{ p: 0 }} onClick={handleClickSettings}>
							<Avatar alt="YOU" src={ import.meta.env.VITE_BACK_URL + '/users/avatar/' + myId } />
						</IconButton>
						</Tooltip>
					</Box>
				</Toolbar>
			</AppBar>
		);
	}

	useEffect(() => {
		if (!socket) return ;
		if (!socketPong) return ;
		socket.on('displayInvit', (reponse: invitDTO) => {
			if (reponse.type === 'CHAT') {
				if (reponse.channelId)
					showToast(<ChatInvite author={reponse.username} chanId={reponse.channelId} socket={socket} />);
			} else if (reponse.type === 'FRIEND') {
				if (reponse.friendId)
					showToast(<ToastFriendRequest author={reponse.username} friendId={reponse.friendId} socket={socket} />);
			}
		});
		socketPong?.on('displayInvit', (reponse: invitDTO) => {
			if (reponse.type === 'GAME') {
				showToast(<GameInvite author={reponse.username} friendId={reponse.friendId} socket={socketPong} />);
			}
		})
		socketPong.on('launchOnInvit', () => {
			navigate('/game/pong-online');
		})
		return () => {
			socket?.off('displayInvit');
			socketPong.off('displayInvit');
			socketPong.off('launchOn');
		}
	},[socket, socketPong]);

	return (
		<div className="layout">
			<div className="header">
				<div className='appbar'>
					<ResponsiveAppBar/>
				</div>
			</div>
			<div className="content">
				<Outlet />
			</div>
			<div className='background'>
				<div id="stars"></div>
				<div id="stars2"></div>
				<div id="stars3"></div>
			</div>
		</div>
	);
}

