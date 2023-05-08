import React, { createContext, useContext, useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { getAccess } from "../../utils/ApiClient";

// export const socket = io('localhost:5000/pong', {auth: {accessToken: getAccess()}}); // Remplacez l'URL par celle de votre serveur
// export const SocketProvider = SocketContext.Provider;

export const PongSocketContext = createContext<Socket | null >(null);

export function PongSocketProvider({ children }: any) {
    // On initialise le socket a null.
    const [socket, setSocket] = useState<Socket | null>(null);
    //TODO: remplacer le isLogged hook par un global contexte avec le user id et token
    const [isLogged, setIsLogged] = useState<boolean>(getAccess() ? true :
false);

    //TODO: useEffect vraiment utile? Et peut etre faudrait fix le fait que lorsque
    //vite hot reload quand on modifi ce fichier, ca deco pas le socket et ca en cree
    //un nouveau!!! Du coup c'est chiant on se retrouve avec 15 sockets apres
    useEffect(() => {
        if (isLogged && !socket) {
            //TODO: le auth header est definitif. Cad que on pourra pas le changer
            //quand on aura refresh le token. Donc faut remplacer ca par add sur 
            //toutes les 'requetes' du socket l'accessToken dans les datas send. 
            //Genre que ce soit tjrs le dernier ou le premier argument. Mais c'est le
            //socket interceptor qui va s'en charger.
            const instance = io(`${import.meta.env.VITE_BACK_URL}/pong`, {auth: {accessToken: getAccess()}});
            instance.on('connect', () => {
                setSocket(instance);
                console.log('Socket connected with id ' + instance.id);
            });
            instance.on('disconnect', (reason, description) => {
                setSocket(null);
                console.log('Socket ', instance.id, ' has been disconnected. Reason: ', reason, ' description: ', description);
            });
        }
        else if (!isLogged && socket) {
            socket.disconnect();
            setSocket(null);
        }
    }, [isLogged]);


    return (
        <PongSocketContext.Provider value={socket}>
            {children}
        </PongSocketContext.Provider>

    );
}

export{}
