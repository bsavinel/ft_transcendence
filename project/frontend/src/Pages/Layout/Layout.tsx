import {useContext, useEffect, useState} from 'react';
import { Link, Outlet } from 'react-router-dom';
import {ChatSocketContext} from '../../Component/Chat/ChatSocketContext';
import NavBar from '../../Component/NavBar/NavBar';
import {invitDTO} from '../../Component/Notification/NotificationList';
import showToast, {ChatInvite, ToastFriendRequest, GameInvite} from '../../Component/toast/toast';

import './Layout.css';
import './stars.scss';

interface LayoutProps {
	handleTheme: () => void;
}

const Ball = () => {
	return (
		<circle
			cx={50}
			cy={50}
			r={5}
			fill="grey"
			stroke="white"
			strokeWidth="2"
		/>
	);
};

const Title = () => {
	return (
		<text
			x={200}
			y={100}
			fill="white"
			fontSize="50"
			fontFamily="Lobster"
			fontStyle="italic"
			fontWeight="bold"
		>
			TRANSCENDANCE
		</text>
	);
};

const Background = ({}: {}) => {
	return (
		<svg width={2000} height={150} viewBox={`0 0 ${2000} ${150}`}>
			<Title />
		</svg>
	);
};

// <<<<<<< HEAD
// export default function Layout({handleTheme}: LayoutProps) {
// 	const socket = useContext(ChatSocketContext);
// 	const [invitChat, setInvitChat] = useState<boolean>(false);
// 	const [invitFriend, setInvitFriend] = useState<boolean>(false);
// 	const [invitGame, setInvitGame] = useState<boolean>(false);
// 	const [author, setAuthor] = useState<string>('');
// 	const [chanId, setChanId] = useState<number | undefined>(undefined);
// 	const [friendId, setFriendId] = useState<number | undefined>(undefined);

// 	useEffect(() => {
// 		socket?.on('displayInvit', (reponse: invitDTO) => {
// 			if (reponse.type === 'CHAT') {
// 				setInvitChat(true)
// 				setChanId(reponse.channelId);
// 			} else if (reponse.type === 'FRIEND') {
// 				setInvitFriend(true);
// 				setFriendId(reponse.friendId);
// 			} else {
// 				setInvitGame(true);
// 			}
// 			setAuthor(reponse.username);
// 		});
// 		return () => {
// 			socket?.off('displayInvit');
// 		}
// 	},[socket]);

// 	// Les parenthèses vides à la fin de la condition sont en fait une façon de s'assurer que la fonction anonyme est exécutée immédiatement.

// 	// En JavaScript, une paire de parenthèses autour d'une expression fonctionnelle la transforme en une expression de fonction appelée immédiatement (IIFE - Immediately Invoked Function Expression). Cela signifie que la fonction sera exécutée immédiatement au moment de la compilation, plutôt qu'attendre qu'elle soit appelée plus tard dans le code.

// 	// Dans ce cas, nous utilisons une IIFE pour que la fonction anonyme soit exécutée immédiatement lorsque la condition est remplie. Cela garantit que `showToast(ChatInvite(author, chanId))` et `setInvitChat(false)` seront tous deux exécutés dans l'ordre correct.
//   return (
//     <>
//       <div className='layout'>
//         <div className='header' id='backgroudstars'>
//           <Link to={`/`}>
//             <Background />
//             <div id="stars"></div>
//             <div id="stars2"></div>
//             <div id="stars3"></div>
//           </Link>
//         </div>
//         <div className='content'>
//           <div className='maincontent'>
//             <Outlet />
//           </div>
//           <div className='navcontent'>
//             <NavBar handleTheme={handleTheme}/>
//           </div>
//         </div>
//       </div>
//       {invitChat && chanId && (() => {
//         showToast(ChatInvite(author, chanId));
//         setInvitChat(false);
//         setAuthor('');
//         setChanId(undefined);
//       })()}
//       {invitFriend && friendId && (() => {
//         showToast(ToastFriendRequest(author, friendId));
//         setInvitFriend(false);
//         setAuthor('');
//         setFriendId(undefined);
//       })()}
//       {invitGame && (() => {
//         showToast(GameInvite(author));
//         setInvitGame(false);
//         setAuthor('');
//       })()}
//     </>
//   );
// =======
export default function Layout({ handleTheme }: LayoutProps) {
	const socket = useContext(ChatSocketContext);
	const [invitChat, setInvitChat] = useState<boolean>(false);
	const [invitFriend, setInvitFriend] = useState<boolean>(false);
	const [invitGame, setInvitGame] = useState<boolean>(false);
	const [author, setAuthor] = useState<string>('');
	const [chanId, setChanId] = useState<number | undefined>(undefined);
	const [friendId, setFriendId] = useState<number | undefined>(undefined);

	useEffect(() => {
		socket?.on('displayInvit', (reponse: invitDTO) => {
			if (reponse.type === 'CHAT') {
				setInvitChat(true)
				setChanId(reponse.channelId);
			} else if (reponse.type === 'FRIEND') {
				setInvitFriend(true);
				setFriendId(reponse.friendId);
			} else {
				setInvitGame(true);
			}
			setAuthor(reponse.username);
		});
		return () => {
			socket?.off('displayInvit');
		}
	},[socket]);

	return (
		<>
		<div className="layout">
			<div className="header" id="backgroudstars">
				<Link style={{ textDecoration: 'none' }} to={`/`}>
					<div className="textHeader">
						<Link style={{ textDecoration: 'none' }} to={`/`}>
							<h1 className="headerTitle">TRANSCENDANCE</h1>
						</Link>
						<div className="router">
							<Link
								style={{ textDecoration: 'none' }}
								to={`/game`}
							>
								<p>Game</p>
							</Link>
							<Link
								style={{ textDecoration: 'none' }}
								to={`/chat`}
							>
								<p>Chat</p>
							</Link>
							<Link
								style={{ textDecoration: 'none' }}
								to={`/setting`}
							>
								<p>Settings</p>
							</Link>
						</div>
					</div>
					<div id="backgroudstars">
						<div id="stars"></div>
						<div id="stars2"></div>
						<div id="stars3"></div>
					</div>
				</Link>
			</div>
			<div className="content">
				{/* <div className='maincontent'> */}
				<Outlet />
				{/* </div> */}
				{/* <div className='navcontent'>
                    <NavBar handleTheme={handleTheme}/>
                </div> */}
			</div>
		</div>
      {invitChat && chanId && (() => {
        showToast(ChatInvite(author, chanId));
        setInvitChat(false);
        setAuthor('');
        setChanId(undefined);
      })()}
      {invitFriend && friendId && (() => {
        showToast(ToastFriendRequest(author, friendId));
        setInvitFriend(false);
        setAuthor('');
        setFriendId(undefined);
      })()}
      {invitGame && (() => {
        showToast(GameInvite(author));
        setInvitGame(false);
        setAuthor('');
      })()}
    </>
	);
}
