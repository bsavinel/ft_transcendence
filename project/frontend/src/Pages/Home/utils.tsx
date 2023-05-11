var defValueMe = {
	id: 3,
	username: 'bsavinel',
	avatarUrl:
		'https://cdn.intra.42.fr/users/fbdd1b21de009c605831e5f3cdeba836/bsavinel.jpg',
	gameWins: 2,
	gameLoses: 1,
};

export interface Game {
	id: number;
	oponentUsername: string;
	oponentId: number;
	yourScore: number;
	oponentScore: number;
	asWin: number;
}

export interface GameRequest {
	id: number;
	createdAt: Date;
	winnerId: number;
	isFinish: boolean;
	players: 
		{
			asWin: boolean;
			score: number;
			userId: number;
			user:{
				id: number,
				username: string
			}
		}[]
	;
	// playerId1: number;
	// player1username: string;
	// playerId2: number;
	// player2username: string;
	// player1Score: number;
	// player2Score: number;
	// Winner: number;
}

//! ###########################################################
//! ######################### Page ############################
//! ###########################################################
export function GameRequestToGame(gameRequest: GameRequest[], myid: number): Game[] {
	return gameRequest.map((game) => {
		return {
			id: game.id,
			oponentUsername:
				game.players[0].user.id === myid
					? game.players[1].user.username
					: game.players[0].user.username,
			oponentId:
				game.players[0].user.id === myid
					? game.players[1].user.id
					: game.players[0].user.id,
			yourScore:
				game.players[0].user.id === myid
					? game.players[0].score
					: game.players[1].score,
			oponentScore:
				game.players[0].user.id === myid
					? game.players[1].score
					: game.players[0].score,
			asWin: game.winnerId === myid ? 1 : 0,
		};
	});
}
