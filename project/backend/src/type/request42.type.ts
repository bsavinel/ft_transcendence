export interface reqToken42 {
	grant_type: string /* aucune idee mais obligatoire*/;
	client_id: string /*id de l'app*/;
	client_secret: string /*ce aui a ete recus avec la requete depuis le front*/;
	code: string /*code recu depuis le front*/;
	redirect_uri?: string /*une url ou est redirige la page apres (optionel et je pense inutile ici)*/;
	state?: string /*random string*/;
}