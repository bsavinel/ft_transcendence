import {
	Controller,
	Get,
	Body,
	Post,
	BadRequestException,
	NotFoundException,
	Req,
	UseGuards,
	Delete,
	Res,
} from '@nestjs/common';
import axios from 'axios';
import { RefreshGuard } from 'src/guards/refresh.guard';
import { RequestWithRefresh } from 'src/type/token.type';
import { TokenService } from './token.service';
import { reqToken42 } from 'src/type/request42.type';
import { Response } from 'express';
import { addDays } from 'date-fns';
import { UsersService } from 'src/users/users.service';
import { createWriteStream } from 'fs';

@Controller('oauth')
export class OauthController {
	constructor(
		private readonly tokenManager: TokenService,
		private readonly userService: UsersService
	) {}

	//!###################################################################################
	//!###############################     CONNECTION      ###############################
	//!###################################################################################

	@Post('/singin')
	async signup(
		@Body() Data: { code: string },
		@Res({ passthrough: true }) response: Response
	): Promise<{
		accessToken: string;
		newUser: boolean;
	}> {
		let newUser = false;
		const pathApi: string = this.buildPath42(Data.code);

		// ***** requete pour avoir le token d'acces pour les requete 42 *****
		try {
			var responseApi = await axios.post(pathApi);
			// console.log(responseApi.data);
		} catch (e) {
			console.log('error');
			if (e.status == 404) throw new NotFoundException('Api not found');
			throw new BadRequestException("Can't get 42token");
		}

		// ***** Requete pour avoir les info du mec *****
		try {
			var responseApi = await axios.get(
				`${process.env.VITE_API42}/v2/me`,
				{
					headers: {
						Authorization:
							'Bearer ' + responseApi.data.access_token,
					},
				}
			);
		} catch (e) {
			if (e.responseApi.status == 404) {
				throw new NotFoundException('Api not found');
			}
			throw new BadRequestException("Can't get 42 identity");
		}
		if (!(await this.userService.user42Exist(responseApi.data.id))) {

			newUser = true;

			const avatarPath: string = await this.downloadImage(responseApi.data.image.versions.medium);

			await this.userService.createUser({
				id42: responseApi.data.id,
				username: responseApi.data.login,
				avatarUrl: avatarPath,
			});
		}

		const user = await this.userService.findUserWith42(responseApi.data.id);
		const refreshToken: string =
			await this.tokenManager.generateRefreshToken(user.id);
		const accessToken: string = await this.tokenManager.generateAccessToken(
			user.id
		);

		const expiration = addDays(new Date(), 6);
		response.cookie('refreshToken', refreshToken, {
			expires: expiration,
			path: '/oauth',
			httpOnly: true,
		});
		return { accessToken, newUser };
	}

	//!################################################################################
	//!#########################     FORCE TO BE SOMEONE      #########################
	//!################################################################################

	// @Post('/force')
	// async force(
	// 	@Body() Data: { id42: number; username: string; avatarUrl: string },
	// 	@Res({ passthrough: true }) response: Response
	// ): Promise<{
	// 	accessToken: string;
	// }> {
	// 	if (!(await this.userService.user42Exist(Data.id42))) {
	// 		await this.userService.createUser(Data);
	// 	}
	// 	console.log('truc');
	// 	const user = await this.userService.findUserWith42(Data.id42);
	// 	const refreshToken: string =
	// 		await this.tokenManager.generateRefreshToken(user.id);
	// 	const accessToken: string = await this.tokenManager.generateAccessToken(
	// 		user.id
	// 	);
	// 	console.log('cookie');
	// 	const expiration = addDays(new Date(), 6);
	// 	response.cookie('refreshToken', refreshToken, {
	// 		expires: expiration,
	// 		path: '/',
	// 		httpOnly: true,
	// 	});
	// 	console.log('fin');
	// 	return { accessToken };
	// }

	//!################################################################################
	//!###############################     REFRESH      ###############################
	//!################################################################################

	@Get('/refresh')
	@UseGuards(RefreshGuard)
	async getNewToken(
		@Req() request: RequestWithRefresh,
		@Res({ passthrough: true }) response: Response
	): Promise<{ accessToken: string }> {
		//? le timeout est pour eviter de deconecter le user de partout si on s'ammuse a spam des refrechs
		setTimeout(() => {
			this.tokenManager.deleteRefreshToken(request.refreshToken.code);
		}, 1000);
		const refreshToken: string =
			await this.tokenManager.generateRefreshToken(
				request.refreshToken.userId
			);
		const accessToken: string = await this.tokenManager.generateAccessToken(
			request.refreshToken.userId
		);
		const expiration = addDays(new Date(), 6);
		response.cookie('refreshToken', refreshToken, {
			expires: expiration,
			path: '/oauth',
			httpOnly: true,
		});
		return { accessToken };
	}

	//!######################################################################################
	//!###############################      DISCONECTION      ###############################
	//!######################################################################################

	@Delete('/disconect')
	@UseGuards(RefreshGuard)
	async disconect(@Req() request: RequestWithRefresh): Promise<void> {
		await this.tokenManager.deleteRefreshToken(request.refreshToken.code);
	}

	//? est-ce que je renvoie un refresh token pour qu'il reste quand meme log ou il est
	@Delete('/disconectEveryWhere')
	@UseGuards(RefreshGuard)
	async disconectEveryWhere(
		@Req() request: RequestWithRefresh
	): Promise<number> {
		return await this.tokenManager.disconectFromEveryWhere(
			request.refreshToken.userId
		);
	}

	buildPath42(code: string): string {
		const body42: reqToken42 = {
			grant_type: 'authorization_code' /* aucune idee mais obligatoire*/,
			client_id: process.env.VITE_API_KEYPUB /*id de l'app*/,
			client_secret:
				process.env
					.API_KEYPRI /*ce qui a ete recus avec la requete depuis le front*/,
			redirect_uri: `${process.env.VITE_FRONT_URL}/callback`,
			code: code,
		};
		return `${process.env.VITE_API42}/oauth/token?grant_type=${body42.grant_type}&client_id=${body42.client_id}&client_secret=${body42.client_secret}&code=${body42.code}&redirect_uri=${body42.redirect_uri}`;
	}

	private async downloadImage(url: string): Promise<string> {
		const response = await axios({
			method: 'get',
			url: url,
			responseType: 'stream',
		});

		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
		const path = './uploads/' + uniqueSuffix + '.jpg';
		const writer = createWriteStream(path);
		response.data.pipe(writer);

		return path;
	}
}
