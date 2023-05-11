import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import './LeaderPart.scss';
import ApiClient from '../../../utils/ApiClient';
interface Profile {
	userId: number;
	username: string;
	avatarUrl: string;
	level: number;
	lose: number;
	win: number;
}

async function getAllPofile() {
	try {
		let response = await ApiClient.get('/users');
		let usersStat = response.data;
		usersStat = usersStat.map((user: any) => ({
			...user,
			userId: user.id,
			id: undefined,
		}));
		return usersStat;
	} catch (e) {
		return null;
	}
}

// var world
// = ProfileGenerator2(27);

const columns: GridColDef[] = [
	{
		field: 'usename',
		headerName: 'username',
		description: 'This column has a value getter and is not sortable.',
		sortable: false,
		width: 160,
		valueGetter: (params: GridValueGetterParams) =>
			JSON.stringify({
				username: params.row.username,
				userId: params.row.userId,
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
		field: 'Win',
		headerName: 'win',
		type: 'number',
		valueGetter: (params: GridValueGetterParams) =>
			`${params.row.win === null ? '' : params.row.win}`,
		width: 150,
	},
	{
		field: 'Lose',
		headerName: 'lose',
		type: 'number',
		valueGetter: (params: GridValueGetterParams) =>
			`${params.row.lose === null ? '' : params.row.lose}`,
		width: 150,
	},
	{
		field: 'WinRate',
		headerName: 'WinRate',
		type: 'string',
		valueGetter: (params: GridValueGetterParams) =>
			`${
				params.row.lose === null
					? ''
					: params.row.win + params.row.lose == 0
					? '-'
					: `${Math.floor(
							(params.row.win /
								(params.row.win + params.row.lose)) *
								100
					  )}%`
			}`,
		width: 150,
		sortComparator: (v1, v2) => {
			if (v1 === '100%') return 1;
			if (v2 === '100%') return -1;
			if (v1 === '-') return -1;
			if (v2 === '-') return 1;
			return v1.slice(0, -1) - v2.slice(0, -1);
		},
	},
	{
		field: 'Level',
		headerName: 'level',
		type: 'string',
		valueGetter: (params: GridValueGetterParams) =>
			JSON.stringify({
				level: Math.floor(params.row.level),
				percent: Math.floor((params.row.level - Math.floor(params.row.level)) * 100),
			}),
		width: 150,
		renderCell: (str) => {
			let param = JSON.parse(str.value);
			if (param.level === null) return '';
			return (
				<span>
					Level {param.level}{param.percent ? `.${Math.floor(param.percent / 10)}` : ""}
				</span>
			);
		},
		sortComparator: (v1, v2) => {
			let param1 = JSON.parse(v1);
			let param2 = JSON.parse(v2);
			let val1 = param1.level * 100 + param1.percent;
			let val2 = param2.level * 100 + param2.percent;
			return val1 - val2;
		},
	},
];

export default function LeaderPart() {
	const [world, setWorld] = useState<Profile[]>([]);

	useEffect(() => {
		(async () => {
			let tmp = await getAllPofile();
			setWorld(tmp);
		})();
	}, []);

	return (
		<div className="LeaderPart" id="leaderBoard">
			<div className="LeaderBoard">
				<h1>LeaderBoard</h1>
				<div className="grid">
					<DataGrid
						rows={world.map((e, id) => {
							return { ...e, id };
						})}
						columns={columns}
						initialState={{
							pagination: {
								paginationModel: {
									pageSize: 20,
								},
							},
						}}
						pageSizeOptions={[20]}
						// autoHeight
						disableRowSelectionOnClick
					/>
				</div>
			</div>
			<div className="Podium">
				<h1>Podium</h1>
				<div className="marche">
					{world[1] === undefined ? (
						<div className="secondPlace" />
					) : (
						<div className="secondPlace">
							<img className="avatar" src={world[1].avatarUrl} />
							<div className="pseudo">
								<p className="username">{world[1].username}</p>
								<p className="personalId">#{world[1].userId}</p>
							</div>
						</div>
					)}
					{world[0] === undefined ? (
						<div className="firstPlace" />
					) : (
						<div className="firstPlace">
							<img className="avatar" src={world[0].avatarUrl} />
							<div className="pseudo">
								<p className="username">{world[0].username}</p>
								<p className="personalId">#{world[0].userId}</p>
							</div>
						</div>
					)}
					{world[2] === undefined ? (
						<div className="thirdPlace" />
					) : (
						<div className="thirdPlace">
							<img className="avatar" src={world[2].avatarUrl} />
							<div className="pseudo">
								<p className="username">{world[2].username}</p>
								<p className="personalId">#{world[2].userId}</p>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
