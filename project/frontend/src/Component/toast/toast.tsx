import { useContext } from 'react';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Socket } from 'socket.io-client';
import { ChatSocketContext } from '../Chat/ChatSocketContext';
import { PongSocketContext } from '../Pong/PongSocketContext';
import "./toast.css";


interface ToastFriendRequestProps {
	author: string,
	friendId: number,
	socket: Socket,
}
export function ToastFriendRequest({author, friendId, socket} : ToastFriendRequestProps) {
	return (
		<>
			<div className="textFriendRequest">
				<span style={{ color: "cyan", textTransform: "uppercase" }}>
					{author + " "}
				</span>
				 want to be your friend!
			</div>
			<div className="buttonToast">
				<button className="accept" onClick={() => socket.emit('handleFriendInvit', { friendId: friendId, accept: true })}>Accept</button>
				<button className="refuse" onClick={() => socket.emit('handleFriendInvit', { friendId: friendId, accept: false })}>Refuse</button>
			</div>
		</>
	);
}

interface GameInviteProps {
	author: string,
	socket: Socket,
	friendId: number | undefined,
}

export function GameInvite({author, socket, friendId}: GameInviteProps) {
	return (
		<>
			<div className="textFriendRequest">
				<span style={{ color: "#20e181", textTransform: "uppercase" }}>
					{author + " "}
				</span>
				 invite you to play!
			</div>
			<div className="buttonToast">
				<button className="accept" onClick={() => socket?.emit('handleGameInvit', { friendId: friendId, accept: true })}>Play</button>
				<button className="refuse" onClick={() => socket?.emit('handleGameInvit', { friendId: friendId, accept: false })}>Denied</button>
			</div>
		</>
	);
}

interface ChatInviteProps {
	author: string,
	chanId: number,
	socket: Socket,
}
export function ChatInvite({author, chanId, socket} : ChatInviteProps) {
	return (
		<>
			<div className="textFriendRequest">
				<span style={{ color: "#20e181", textTransform: "uppercase" }}>
					{author + " "}
				</span>
				invites you on a private channel.
			</div>
			<div className="buttonToast">
				<button className="accept" onClick={() => socket?.emit('handleChatInvit', { chanId: chanId, accept: true })}>Accept</button>
				<button className="refuse" onClick={() => socket?.emit('handleChatInvit', { chanId: chanId, accept: false })}>Denied</button>
			</div>
		</>
	);

}

export default function showToast(content: JSX.Element | string) {
	toast(content, {
		autoClose: 10000,
		position: "top-right",
		theme: "dark", // (/*consition pour le theme*/) ? "dark" : "light",
	});
}
