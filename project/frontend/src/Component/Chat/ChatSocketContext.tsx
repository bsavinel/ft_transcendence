import { io, Socket } from "socket.io-client";
import { createContext } from "react";

export const socket = io('http://localhost:5000/chatns');
export const ChatSocketContext = createContext<Socket>(socket);
export const ChatSocketProvider = ChatSocketContext.Provider;
