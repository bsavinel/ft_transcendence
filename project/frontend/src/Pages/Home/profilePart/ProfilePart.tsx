import { GameRequestToGame, Game, GameRequest } from '../utils';
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import ApiClient from '../../../utils/ApiClient';
import { useEffect, useState } from 'react';
import './ProfilePart.scss';
import { id } from 'date-fns/locale';
import { Box, CircularProgress } from '@mui/material';
import Paper from '@mui/material/Paper';

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

export default function ProfilePart({userId}: { userId: number }) {
	const [user, setUser] = useState<UserProfile | undefined>(undefined);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [game, setGame] = useState<Game[]>([]);
	const [nbUser, setNbUser] = useState<number>(0);

	console.log(userId);
	useEffect(() => {
		Promise.all([
			getProfile(userId),
			getNumberUser(),
			getGame(userId)
		]).then(([profile, nbUser, game]) => {
			setUser(profile);
			setNbUser(nbUser);
			setGame(GameRequestToGame(game, userId));
			setIsLoading(false);
		});
	}, []);

	if (isLoading) {
		return (
			<Box sx={{width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}} >
				<CircularProgress size={120}/>
			</Box>
		);
	} else if (user === undefined) {
		return (
			<div className="profile" id="profile">
				Profile dosen't exist
			</div>
		);
	}
	return (
		<div className="profile" id="profile">
			<div className="ProfileInfo">
				<img className="avatar" src={import.meta.env.VITE_BACK_URL + '/users/avatar/' + user.userId } />
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
