import {useContext, useEffect, useState} from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import {ChatSocketContext} from '../../Component/Chat/ChatSocketContext';
import NavBar from '../../Component/NavBar/NavBar';
import {invitDTO} from '../../Component/Notification/NotificationList';
import showToast, {ChatInvite, ToastFriendRequest, GameInvite} from '../../Component/toast/toast';

import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';

import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';

import './Layout.css';
import './stars.scss';

interface LayoutProps {
	handleTheme: () => void;
}

export default function Layout({ handleTheme }: LayoutProps) {
	const socket = useContext(ChatSocketContext);
	const [invitChat, setInvitChat] = useState<boolean>(false);
	const [invitFriend, setInvitFriend] = useState<boolean>(false);
	const [invitGame, setInvitGame] = useState<boolean>(false);
	const [author, setAuthor] = useState<string>('');
	const [chanId, setChanId] = useState<number | undefined>(undefined);
	const [friendId, setFriendId] = useState<number | undefined>(undefined);
	
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

	return (
		<AppBar position="static" sx={{ backgroundColor: (theme) => theme.palette.primary.main }}>
			<Container maxWidth="xl">
				<Toolbar disableGutters>
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
					fontWeight: 700,
					letterSpacing: '.3rem',
					color: 'inherit',
					textDecoration: 'none',
					}}
				>
					Transcendance
				</Typography>
				<Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
					<Button
						key='Game'
						onClick={handleClickGame}
						sx={{ my: 2, color: 'white', display: 'block', ml: 3 }}
					>
						Game
					</Button>
					<Button
						key='Chat'
						onClick={handleClickChat}
						sx={{ my: 2, color: 'white', display: 'block', ml: 1 }}
					>
						Chat
					</Button>
				</Box>
				<Box sx={{ flexGrow: 0 }}>
					<Tooltip title="Open settings">
					<IconButton  sx={{ p: 0 }} onClick={handleClickSettings}>
						<Avatar alt="YOU" src="/static/images/avatar/2.jpg" />
					</IconButton>
					</Tooltip>
				</Box>
				</Toolbar>
			</Container>
			</AppBar>
		);
	}

	useEffect(() => {
		socket?.on('displayInvit', (reponse: invitDTO) => {
			if (reponse.type === 'CHAT') {
				setInvitChat(true)
				setChanId(reponse.channelId);
			} else if (reponse.type === 'FRIEND') {
				setInvitFriend(true);
				setFriendId(reponse.friendId);
			} else {
				setInvitGame(true);
			}
			setAuthor(reponse.username);
		});
		return () => {
			socket?.off('displayInvit');
		}
	},[socket]);

	return (
		<>
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
      {invitChat && chanId && (() => {
        showToast(ChatInvite(author, chanId));
        setInvitChat(false);
        setAuthor('');
        setChanId(undefined);
      })()}
      {invitFriend && friendId && (() => {
        showToast(ToastFriendRequest(author, friendId));
        setInvitFriend(false);
        setAuthor('');
        setFriendId(undefined);
      })()}
      {invitGame && (() => {
        showToast(GameInvite(author));
        setInvitGame(false);
        setAuthor('');
      })()}
    </>
	);
}