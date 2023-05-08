import { useContext } from 'react';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ChatSocketContext } from '../Chat/ChatSocketContext';
import "./toast.css";


export function ToastFriendRequest(author: string, friendId: number) {
	const socket = useContext(ChatSocketContext);
	return (
		<>
			<div className="textFriendRequest">
				<span style={{ color: "cyan", textTransform: "uppercase" }}>
					{author + " "}
				</span>
				 want to be your friend!
			</div>
			<div className="buttonToast">
				<button className="accept" onClick={() => socket?.emit('handleFriendInvit', { friendId: friendId, accept: true })}>Accept</button>
				<button className="refuse" onClick={() => socket?.emit('handleFriendInvit', { friendId: friendId, accept: false })}>Refuse</button>
			</div>
		</>
	);
}

export function GameInvite(author: string) {
	return (
		<>
			<div className="textFriendRequest">
				<span style={{ color: "#20e181", textTransform: "uppercase" }}>
					{author + " "}
				</span>
				 invite you to play!
			</div>
			<div className="buttonToast">
				<button className="accept" onClick={() => console.log("accept")}>Play</button>
				<button className="refuse" onClick={() => console.log("refuse")}>Denied</button>
			</div>
		</>
	);
}

export function ChatInvite(author: string, chanId: number) {
	const socket = useContext(ChatSocketContext);
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
