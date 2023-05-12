import React, { useContext, useEffect, useState } from 'react';
import { Alert, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Snackbar } from '@mui/material';
import SportsEsportsOutlinedIcon from '@mui/icons-material/SportsEsportsOutlined';
import DoneIcon from '@mui/icons-material/Done';
import ClearIcon from '@mui/icons-material/Clear';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import ApiClient from '../../utils/ApiClient';
import {ChatSocketContext} from '../Chat/ChatSocketContext';

export interface invitDTO {
	type: "GAME" | "CHAT" | "FRIEND";
	friendId: number | undefined;
	channelId: number | undefined;
	id: number;
	username: string;
}
//TODO
//refresh la liste des channel/friend && liste des notif!
export default function NotificationList() {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [invit, setInvit] = useState<invitDTO[] | undefined>();
	const [acceptSnack, setAcceptSnack] = useState<boolean>(false);
	const [deniedSnack, setDeniedSnack] = useState<boolean>(false);
	const [errorSnack, setErrorSnack] = useState<boolean>(false);
	const socket = useContext(ChatSocketContext);

	const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
	};

	const invitList = invit?.map((data: invitDTO) => {
		return (
			<MenuItem key={data.id}>
				{data.type === 'CHAT' &&
				<>
					<ListItemIcon>
						<ForumOutlinedIcon />
					</ListItemIcon>
					<ListItemText>{data.username} invites you on a private channel</ListItemText>
				
					<IconButton onClick={() => 
						socket?.emit('handleChatInvit', 
												 { chanId: data.channelId, accept: true }, 
												 (response: boolean) => updateInvitList(response, data.id, true))}
					>
						<DoneIcon color='success'/>
					</IconButton>
					<IconButton onClick={() => 
						socket?.emit('handleChatInvit', 
												 { chanId: data.channelId, accept: false }, 
									 		 (response: boolean) => updateInvitList(response, data.id, false))}
					>
						<ClearIcon color='error' />
					</IconButton>
				</>
				}
				{data.type === 'GAME' &&
					<>
						<ListItemIcon>
							<SportsEsportsOutlinedIcon />
						</ListItemIcon>
						<ListItemText>{data.username} invite you to play</ListItemText>
				 
						<IconButton>
							<DoneIcon color='success'/>
						</IconButton>
						<IconButton>
							<ClearIcon color='error' />
						</IconButton>
					</>
				}
				{data.type === 'FRIEND' &&
					<>
						<ListItemIcon>
							<PersonOutlineIcon />
						</ListItemIcon>
						<ListItemText>{data.username} need to be your friend</ListItemText>
						<IconButton onClick={() => 
							socket?.emit('handleFriendInvit', 
													 { friendId: data.friendId, accept: true }, 
													 (response: boolean) => updateInvitList(response, data.id, true))}
						>
							<DoneIcon color='success'/>
						</IconButton>
						<IconButton onClick={() => 
							socket?.emit('handleFriendInvit', 
													 { friendId: data.friendId, accept: false }, 
													 (response: boolean) => updateInvitList(response, data.id, false))}
						>
							<ClearIcon color='error' />
						</IconButton>
					</>
				}
			</MenuItem>
		)});

	function updateInvitList(update:boolean, invitIdToRemove: number, accept:boolean) {
		if (update) {
			const updatedInvitList = invit?.filter((invit) => invit.id !== invitIdToRemove);
			setInvit(updatedInvitList);
			setAcceptSnack(true);
			if (!accept) {
				setDeniedSnack(true);
			}
		} else {
			setErrorSnack(true);
		}
	}

	async function fetchInvit() {
		const getInvit: invitDTO[] = (await ApiClient.get('invitations')).data;
		console.log(getInvit);
		setInvit(getInvit);
	}

	useEffect(() => {
		fetchInvit();
	},[])

	return (
		<>
			<IconButton onClick={handleMenuOpen}>
				<NotificationsNoneIcon color='inherit' />
			</IconButton>
			<Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
				{invit?.length === 0 ? 
				<MenuItem>
					<ListItemIcon>
						<AssignmentTurnedInIcon color='success'/>
					</ListItemIcon>
					<ListItemText>Y'a pas de notif, reviens plus tard!</ListItemText>
				</MenuItem> 
				: invitList }
			</Menu>
			<Snackbar
				open={acceptSnack}
				onClose={() => setAcceptSnack(false)}
				autoHideDuration={6000}
			>
				<Alert severity="success"><strong>Invitation accepted!</strong></Alert>
			</Snackbar>
			<Snackbar
				open={deniedSnack}
				onClose={() => setDeniedSnack(false)}
				autoHideDuration={6000}
			>
				<Alert severity="success"><strong>Invitation denied!</strong></Alert>
			</Snackbar>
			<Snackbar
				open={errorSnack}
				onClose={() => setErrorSnack(false)}
				autoHideDuration={6000}
			>
				<Alert severity="error"><strong>An error has occurred!</strong></Alert>
			</Snackbar>
		</>
	);
}

