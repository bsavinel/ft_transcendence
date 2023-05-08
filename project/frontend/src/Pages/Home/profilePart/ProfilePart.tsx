import { generateGame, GameRequestToGame, Game } from '../utils';
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';

import './ProfilePart.scss';

var defValueMe = {
	userId: 3,
	level: 5,
	percent: 85,
	username: 'bsavinel',
	avatarUrl:
		'https://cdn.intra.42.fr/users/fbdd1b21de009c605831e5f3cdeba836/bsavinel.jpg',
	gameWins: 2,
	gameLoses: 1,
};

function resultGame(game: Game): string {
	if (game.asWin === 1) {
		return `Won ${
			game.yourScore === 5
				? `with +${game.yourScore - game.oponentScore}`
				: 'by forfeit'
		}`;
	} else {
		return `Lose ${
			game.oponentScore === 5
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

var defValueGames = GameRequestToGame(generateGame(37));
//TODO les fleche pour reorganiser le tableau ne marche pas
export default function ProfilePart() {
	return (
		<div className="profile" id="profile">
			<div className="ProfileInfo">
				<img className="avatar" src={defValueMe.avatarUrl} />
				<div className="PlayerStats">
					<div className="NameAndClass">
						<div className="pseudo">
							<p className="username">{defValueMe.username}</p>
							<p className="personalId">#{defValueMe.userId}</p>
						</div>
						<div className="Clasement">
							<div className="IndividualStat">
								<p className="statName">Win</p>
								<p className="statValue">1</p>
							</div>
							<div className="IndividualStat">
								<p className="statName">Lose</p>
								<p className="statValue">
									{defValueMe.gameWins}
								</p>
							</div>
							<div className="IndividualStat">
								<p className="statName">Global rank :</p>
								<p className="statValue">
									{defValueMe.gameWins}{' '}
									<span className="onN">/ val</span>
								</p>
							</div>
							<div className="IndividualStat">
								<p className="statName">Friend rank :</p>
								<p className="statValue">
									{defValueMe.gameWins} <span>/ val</span>
								</p>
							</div>
						</div>
					</div>
					<div className="levelBox">
						<div className="levelNumber">
							Level {defValueMe.level}
						</div>
						<div className="progress">
							<div
								className="progress-bar"
								style={{ width: `${defValueMe.percent}%` }}
							>
							{defValueMe.percent}%
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className="grid">
				<DataGrid
					rows={defValueGames.map((e, id) => {
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
					// getRowClassName={(params) => params.row.asWin === 1 ? 'wining' : 'losing'}
					pageSizeOptions={[10]}
					disableRowSelectionOnClick
				/>
			</div>
		</div>
	);
}
