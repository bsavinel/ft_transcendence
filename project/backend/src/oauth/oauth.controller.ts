import { Controller, Body, Post, BadRequestException, NotFoundException } from '@nestjs/common';
import axios from 'axios';

import { OauthService } from './oauth.service';

interface reqToken {
	grant_type: string /* aucune idee mais obligatoire*/;
	client_id: string /*id de l'app*/;
	client_secret: string /*ce aui a ete recus avec la requete depuis le front*/;
	code: string /*code recu depuis le front*/;
	redirect_uri?: string /*une url ou est redirige la page apres (optionel et je pense inutile ici)*/;
	state?: string /*random string*/;
}

@Controller('oauth')
export class OauthController {
	constructor(private OauthService: OauthService) { }

	@Post()
	async signup(@Body() Data: { code: string }): Promise<{ token: string }> {
		//!##########################################################################
		//!# Utilisation du code recu avec le front pour recuperer un token d'acces #
		//!##########################################################################

		const body42: reqToken = {
			grant_type: 'authorization_code' /* aucune idee mais obligatoire*/,
			client_id: process.env.REACT_APP_API_KEYPUB /*id de l'app*/,
			client_secret:
				process.env
					.API_KEYPRI /*ce qui a ete recus avec la requete depuis le front*/,
			redirect_uri: `${process.env.REACT_APP_FRONT_URL}/callback`,
			code: Data.code,
		};
		let pathApi: string = `${process.env.API_TOKEN}?grant_type=${body42.grant_type}&client_id=${body42.client_id}&client_secret=${body42.client_secret}&code=${body42.code}&redirect_uri=${body42.redirect_uri}`;
		
		
		try {
			var response = await axios.post(pathApi)
		} catch(e) {
			console.log('error');
			if (e.status == 404)
				throw new NotFoundException('Api not found');
			throw new BadRequestException("Can't get token");
		}
		//TODO utiliser l'acess token pour recuperer les infos et verrifier si l'utilisateur existe deja
		return { token: response.data.access_token };
	}
}
