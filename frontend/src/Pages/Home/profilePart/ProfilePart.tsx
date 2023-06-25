import { GameRequestToGame, Game, GameRequest } from '../utils';
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import ApiClient, {getAccessContent} from '../../../utils/ApiClient';
import { useContext, useEffect, useState } from 'react';
import './ProfilePart.scss';
import { Badge, Box, IconButton, styled, CircularProgress, Button } from '@mui/material';
import { PongSocketContext } from '../../../Component/Pong/PongSocketContext';
import { Socket } from 'socket.io-client';
import {ChatSocketContext} from '../../../Component/Chat/ChatSocketContext';
import { id } from 'date-fns/locale';
import Paper from '@mui/material/Paper';
import NoMatch from '../../404';

interface UserProfile {
	userId: string;
	username: string;
	level: number;
	percent: number;
	avatarUrl: string;
	game: Game;
	win: number;
	lose: number;
	winRank: number;
	levelRank: number;
}

function resultGame(game: Game): string {
	if (game.asWin === 1) {
		return `Won ${
			game.yourScore === 11
				? `with +${game.yourScore - game.oponentScore}`
				: 'by forfeit'
		}`;
	} else {
		return `Lose ${
			game.oponentScore === 11
				? `with ${game.yourScore - game.oponentScore}`
				: 'by forfeit'
		}`;
	}
}

const columns: GridColDef[] = [
	{
		field: 'Opponent',
		headerName: 'Opponent',
		sortable: false,
		width: 160,
		valueGetter: (params: GridValueGetterParams<Game>) =>
			JSON.stringify({
				userId: params.row.oponentId,
				username: params.row.oponentUsername,
			}),
		renderCell: (str) => {
			let param = JSON.parse(str.value);
			if (param.username === null) return '';
			return (
				<div className="pseudo">
					<p className="username">{param.username}</p>
					<p className="personalId">#{param.userId}</p>
				</div>
			);
		},
		
	},
	{
		field: 'Your Score',
		headerName: 'YourScore',
		type: 'number',
		valueGetter: (params: GridValueGetterParams<Game>) =>
			`${params.row.yourScore}`,
		width: 150,
	},
	{
		field: 'Opponent Score',
		headerName: 'Opponent Score',
		type: 'number',
		valueGetter: (params: GridValueGetterParams<Game>) =>
			`${params.row.oponentScore}`,
		width: 150,
	},
	{
		field: 'Result',
		headerName: 'Result',
		type: 'string',
		width: 150,
		valueGetter: (params: GridValueGetterParams<Game>) => {
			return resultGame(params.row);
		},
	},
];

async function getProfile(id: number): Promise<UserProfile | undefined> {
	try {
		let res = await ApiClient.get(`/users/profile/${id}`);
		let user = {
			...res.data,
			userId: res.data.id,
			id: undefined,
			level: Math.floor(res.data.level),
			percent: Math.floor((res.data.level - Math.floor(res.data.level)) * 100),
		};
		return user;
	} catch (e) {
		return undefined;
	}
}

async function getGame(id: number): Promise<GameRequest[]> {
	try {
		let res = await ApiClient.get(`/users/${id}/games`);
		return res.data;
	} catch (e) {
		return [];
	}
}

async function getNumberUser(): Promise<number> {
	try {
		let res = await ApiClient.get("/users/nbuser");
		return res.data;
	} catch (e) {
		console.error(e);
		
		return 0;
	}
}

async function getIsFriend(userId: number) {
	try {
		return (await ApiClient.get('/users/isFriend/' + userId)).data;
	} catch (e) {
		return false;
	}
}

async function getIsBlocked(userId: number) {
	try {
		return (await ApiClient.get('/users/IsBlocked/' + userId)).data;
	} catch (e) {
		return false;
	}
}

export default function ProfilePart({userId}: { userId: number }) {
	const [user, setUser] = useState<UserProfile | undefined>(undefined);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [isFriend, setIsFriend] = useState<boolean>(false);
	const [isBlocked, setIsBlocked] = useState<boolean>(false);
	const [game, setGame] = useState<Game[]>([]);
	const [nbUser, setNbUser] = useState<number>(0);
	const [status, setStatus] = useState<string>('offline');
	const pongSocket: Socket | null = useContext(PongSocketContext); 
	const chatSocket: Socket | null = useContext(ChatSocketContext); 
	const myId: number = getAccessContent()?.userId as number;

	useEffect(() => {
		Promise.all([
			getProfile(userId),
			getNumberUser(),
			getGame(userId),
			getIsFriend(userId),
			getIsBlocked(userId),
		]).then(([profile, nbUser, game, resIsFriend, resIsBlocked]) => {
			setUser(profile);
			setNbUser(nbUser);
			setGame(GameRequestToGame(game, userId));
			setIsFriend(resIsFriend)
			setIsBlocked(resIsBlocked)
			setIsLoading(false);
		});
	}, []);

	useEffect(() => {
		if (!pongSocket || !userId) return ;
        pongSocket.emit('getUserStatus', userId, (resStatus: string) => {
			setStatus(resStatus);
        });

	}, [pongSocket, userId]);

	useEffect(() => {
		if (!pongSocket || !userId) return ;
		pongSocket?.on('playerStartsGame', (playerId) => {
				setStatus('inGame');
		});
		pongSocket?.on('playerEndsGame', (playerId) => {
			if (playerId === userId)
				setStatus('online');
		});
		pongSocket?.on('playerDisconnected', (playerId) => {
			if (playerId === userId)
				setStatus('offline');
		});
		pongSocket?.on('playerConnected', (playerId) => {
			if (playerId === userId)
				setStatus('online');
		});
        return  () => {
            pongSocket?.off('playerStartsGame');
            pongSocket?.off('playerEndsGame');
            pongSocket?.off('playerDisconnected');
            pongSocket?.off('playerConnected');
        };
	}, [pongSocket, userId]);

	useEffect(() => {
		if (!chatSocket) return ;
		chatSocket.on('youBlockedUser', (targetId) => {
			if (targetId === userId)
				setIsBlocked(true);
		});
		chatSocket.on('youUnblockedUser', (targetId) => {
			if (targetId === userId)
				setIsBlocked(false);
		});
		chatSocket.on('friendAdded', (targetId) => {
			if (targetId === userId)
				setIsFriend(true);
		});
		chatSocket.on('friendRemoved', (targetId) => {
			if (targetId === userId)
				setIsFriend(false);
		});
        return  () => {
            chatSocket?.off('youBlockedUser');
            chatSocket?.off('youUnblockedUser');
            chatSocket?.off('friendAdded');
            chatSocket?.off('friendRemoved');
        };

	}, [chatSocket, userId]);

    async function sendFriendInvite(toUserId: number) {
        const invitation = [{
            type: "FRIEND",
            friendId: myId,
            invitedUsers: toUserId,
        }];
		const myUsername: string = (await ApiClient.get('users/profile/' + myId)).data.username;
        chatSocket?.emit('newInvit', {invit: invitation, user: myUsername});
    }

	if (isLoading) {
		return (
			<Box sx={{width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}} >
				<CircularProgress size={120}/>
			</Box>
		);
	} else if (user === undefined) {
		return <NoMatch/>
	}

	function setBadgeStatusColor(): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" | undefined {
		if (status === 'online')
			return "success";
		if (status === 'offline')
			return "error";
		return "warning"; // in game
	}	

    function emitBlockUser(targetId: number) {
        chatSocket?.emit('block', targetId);
    }

    function emitUnblockUser(targetId: number) {
        chatSocket?.emit('unblock', targetId);
    }

    function emitRemoveFriend(targetId: number) {
        chatSocket?.emit('removeFriend', targetId);
    }

	return (
		<div className="profile" id="profile">
			<div className="ProfileInfo">
				<Badge
					className='avatar'
					anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
					overlap='circular'
					variant='dot'
					color={setBadgeStatusColor()}
					sx={{ "& .MuiBadge-badge": {width: '30px', height: '30px', borderRadius: '100%'}  }}
				>
					<img className="avatar" src={import.meta.env.VITE_BACK_URL + '/users/avatar/' + user.userId } />
				</Badge>
				<div className="PlayerStats">
					<div className="NameAndClass">
						<div className="pseudo">
							<p className="username">{user.username}</p>
							<p className="personalId">#{user.userId}</p>
						</div>
						<div className="Clasement">
							<div className="IndividualStat">
								<p className="statName">Win</p>
								<p className="statValue">{user.win}</p>
							</div>
							<div className="IndividualStat">
								<p className="statName">Lose</p>
								<p className="statValue">{user.lose}</p>
							</div>
							<div className="IndividualStat">
								<p className="statName">Win rank :</p>
								<p className="statValue">
									{user.winRank}
									<span>/ {nbUser}</span>
								</p>
							</div>
							<div className="IndividualStat">
								<p className="statName">Level rank :</p>
								<p className="statValue">
									{user.levelRank}
									<span>/ {nbUser}</span>
								</p>
							</div>
						</div>
					</div>
					<div className="levelBox">
						<div className="levelNumber">Level {user.level}</div>
						<div className="progress">
							<div
								className="progress-bar"
								style={{ width: `${user.percent}%` }}
							>
								{user.percent}%
							</div>
						</div>
					</div>
				</div>
			</div>
			{userId !== myId ? 
				<Box>
					<Button disabled={isBlocked ? true : false} onClick={isFriend ? () => emitRemoveFriend(userId) : () => sendFriendInvite(userId)} >
						{isFriend ? 'Remove friend' : 'Add friend'}
					</Button>
					<Button onClick={isBlocked ? () => emitUnblockUser(userId) : () => emitBlockUser(userId) } >
						{isBlocked ?  'Unblock user' : 'Block user'}
					</Button>
				</Box>
			: null}
			<div className="grid">
				<DataGrid
					rows={game.map((e, id) => {
						return { ...e, id };
					})}
					columns={columns}
					initialState={{
						pagination: {
							paginationModel: {
								pageSize: 10,
							},
						},
					}}
					getRowClassName={(params : any) => params.row.asWin === 1 ? 'wining' : 'losing'}
					pageSizeOptions={[10]}
					disableRowSelectionOnClick
				/>
			</div>
		</div>
	);
}
