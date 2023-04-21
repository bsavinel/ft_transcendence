export{}

import React, { createContext, useContext, useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

export const socket = io('localhost:5000/pong'); // Remplacez l'URL par celle de votre serveur
export const SocketContext = createContext<Socket>(socket);
export const SocketProvider = SocketContext.Provider;
// export const useSocket = () => useContext(SocketContext);


// export const SocketProvider = ({ children: Socket }) => {
//   const [socket, setSocket] = useState(null);

//   useEffect(() => {
//     setSocket(newSocket);

//     return () => newSocket.close();
//   }, []);

//   return (
//     <SocketContext.Provider value={socket}>
//       {children}
//     </SocketContext.Provider>
//   );
// };
