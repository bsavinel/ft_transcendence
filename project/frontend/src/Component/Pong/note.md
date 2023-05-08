TODO:

OK :
- Changer la direction de la balle au commencement, la balle doit aller vers le joueur 1 ou 2 avec un coef pour changer
- Faire en sorte que les scores soit affiche en responsive en fonction de la taille du board (peut etre KO pour les dimensions du board)
- Regler l'apparition des blocs bonus au bonne endroit et a la bonne vitesse
- Probleme de disparition des blocs bonus (exemple: au moment ou ca touche le paddle)
- Regler la barre du player2 tremblante avec l'utilisation de l'IA (probleme IA speed en fonction de la position de la balle)
- Les bonus s'affichent en haut a cause de la marge du back board
- Ajouter un bouton pour choisir si c'est une partie avec bonus ou pas, contre un IA ou un joueur
- Regrouper les variables en classes
- Rajouter un "press space to play"
- Faire en sorte que les paddles ne depassent pas la taille du board
- Quand les deux joueurs se deco et que je relance une partie, l'etat de la partie precedente est encore en cours. BZR
- Que faire quand un joueur gagne ? (en ligne ou solo)
- Solo : tout bien maj comme la v online
- Quand bonus player 1 l'IA ne bouge pas
- Ajouter la possiblite de niveau d'ia au debut pour le pong solo
- Deco au bout d'inactivite je pense, probleme ponggateway ligne 162, undefined room a fix
- Optimiser l'impact de la balle sur les bonus
- Optimiser le pong online
- Indiquer le score a la fin
- Quand matchmaking, indiquer de quel cote est le joueur
- Delai avant debut de la balle qui part
- Changer score PONG
- URL pong solo modifiable et c'est pas bon
- Affichage score fin de partie (+ esthetique)
- Animation de la box matchmaking a fix quand joueur trouve
- Modif impact paddle player 2 dans classic et power
- Probleme d'overflow x, page game
- CSS page game c'est chelou
- Pong power : mettre les instructions de pouvoir du cote ou le joueur joue
- Marge gauche jeu pong
- Reduire taille ecran pong (1000 x 600 avant)
- Ajout du timer lancement de balle en pong solo
- Message console quand opponent disconnected frontend
- Probleme du await createGame qui bloque la game et la lance jamais
- Fonction prisma pour recup donnes apres match dans la DB, manque finishGame
- leave room ???
- check le bon fonctionnement des implementations finishGame fin de partie 9suppression de player avec leavePong etc...)
- Probleme de winerId fonction finishGame a fix (normal car je fais mes test avec le mm userId)
- Probleme affichage de score a la fin de la aprtie il manque une unite au vainqueur (Valide car changement de once en on dans le front)

KO :

- Modifier conditionalRender pour le socket provider 
- Possibilite de connexion a deux socket avec un user ???

JSP :

- Changer URL socket context par var env
- Header ft_transcendance
- Theme du site ?
- Revoir la position de la souris (probleme quand differente taille de terrain)
- Probleme pour lancer un sort quand il y en a deja un actif (swing puis mind control)


Site pour le pong : https://www.video-game-coder.fr/creer-jeu-video/jeu-pong-javascript/
Initialisation socket serveur nestJS : https://docs.nestjs.com/websockets/gateways
Socket serveur : https://socket.io/docs/v4/server-instance/
Socket client : https://socket.io/docs/v4/client-socket-instance/
Tuto websocket nestJS youtube : https://www.youtube.com/watch?v=fBtNgqIu63g


https://mui.com/material-ui/react-snackbar/

Power-UP :
Attaque surpuissante => Player : envoi une balle droite tres vite
Attaque mentale => Player : envoi une malediction au joueur adversaire, le joueur voit son paddle retrecir
Mur protecteur => Player : met en place un mur devant le joueur pendant x secondes
Rotation => Player : envoi une balle lateral vite