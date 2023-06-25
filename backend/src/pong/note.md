Site exemple websocket Chat : https://www.joshmorony.com/creating-a-simple-live-chat-server-with-nestjs-websockets/

ROOMS : https://socket.io/fr/docs/v3/rooms/


TODO : 

OK :
- Decouper le front pour gestion serveur back
- Reinitialiser le score a la fin d'une partie
- Probleme de promise avec await, des fois ca bloque et le composant client se monte sans recevoir la room et la side
------> normalement c'est bon, a tester avec 4 user (si jamais la fonction waitforpageloaded appelle deux fois, peut etre blocage)

KO:

- Perte d'activation du bonus quand un bonus active + prise d'un autre bonus entre temps