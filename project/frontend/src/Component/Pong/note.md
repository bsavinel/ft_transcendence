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

KO :
- Revoir la position de la souris (probleme quand differente taille de terrain)
- Probleme pour lancer un sort quand il y en a deja un actif (swing puis mind control)

- Fonction prisma pour recup donnes apres match dans la DB
- Deco au bout d'inactivite je pense, probleme ponggateway ligne 162, undefined room a fix
- Optimiser le pong online
- Optimiser l'impact de la balle sur les bonus





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