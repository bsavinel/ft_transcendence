import { io, Socket } from "socket.io-client";
import { createContext, useEffect, useState } from "react";
import { getAccess } from "../../utils/ApiClient";


export const ChatSocketContext = createContext<Socket | null >(null);

export function ChatSocketProvider({ children }: any) {
    // On initialise le socket a null.
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isLogged, setIsLogged] = useState<boolean>(getAccess() ? true :
false);

    useEffect(() => {
        if (isLogged) {
            const instance = io('http://localhost:5000/chatns');
            setSocket(instance);
        } else if (socket) {
            socket.disconnect();
            setSocket(null);
        }
    }, [isLogged]);

    return (
        <ChatSocketContext.Provider value={socket}>
            {children}
        </ChatSocketContext.Provider>

    );
}

