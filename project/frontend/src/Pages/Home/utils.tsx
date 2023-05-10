
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
	playerId1: number;
	player1username: string;
	playerId2: number;
	player2username: string;
	player1Score: number;
	player2Score: number;
	Winner: number;
}

//! ###########################################################
//! ######################### Page ############################
//! ###########################################################

export function GameRequestToGame(gameRequest: GameRequest[]): Game[] {
	return gameRequest.map((game) => {
		return {
			id: game.id,
			oponentUsername:
				game.playerId1 === defValueMe.id
					? game.player2username
					: game.player1username,
			oponentId:
				game.playerId1 === defValueMe.id
					? game.playerId2
					: game.playerId1,
			yourScore:
				game.playerId1 === defValueMe.id
					? game.player1Score
					: game.player2Score,
			oponentScore:
				game.playerId1 === defValueMe.id
					? game.player2Score
					: game.player1Score,
			asWin: game.Winner === defValueMe.id ? 1 : 0,
		};
	});
}
export function generateGame(num: number) {
	var game: GameRequest[] = [];
	for (var i = 0; i < num; i++) {
		let v1 = Math.floor(Math.random() * 6);
		let v2 = Math.floor(Math.random() * 6);
		var game1: GameRequest = {
			id: i,
			playerId1: 3,
			player1username: 'bsavinel',
			playerId2: i + 5,
			player2username: 'test' + i.toString(),
			player1Score: v1,
			player2Score: v2,
			Winner: v1 > v2 ? 3 : i + 5,
		};
		game.push(game1);
	}
	return game;
}
