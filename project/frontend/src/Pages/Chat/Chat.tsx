import {ChatSocketContext} from '../../Component/Chat/ChatSocketContext';
import { useState, useEffect, useContext } from 'react';
import ChannelList  from '../../Component/Chat/ChannelList';
import ChatRoom from '../../Component/Chat/ChatRoom';
import '../../Component/Chat/chat.css';
import ApiClient, { getAccessContent } from '../../utils/ApiClient';
import { AxiosError } from 'axios';
import {Box, CircularProgress, Divider, Paper, useTheme} from '@mui/material';
import {ChannelDto, MessageDto, socketMsgDto, UserOnChannelDto} from '../../Component/Chat/interfaces';

export default function Chat() {
	const socket = useContext(ChatSocketContext);
	// messagesList et users dependent tout les deux du selectedChannel
	const [messagesList, setMessagesList] = useState<MessageDto[]>();
	const [users, setUsers] = useState<UserOnChannelDto[]>();
	const [selectedChannel, setSelectedChannel] = useState<ChannelDto>();
	const [channelList, setChannelList] = useState<ChannelDto[]>([]);
	const [myUsername, setMyUsername] = useState<string>('');

	const [majBrowseList, setMajBrowseList] = useState<boolean>(false);

	// To call when need to refresh ChannelBrowse component.
	function reloadBrowseList() {
		setMajBrowseList(!majBrowseList);
	}

	const [majChanList, setMajChanList] = useState<boolean>(false);

	// To call when need to refresh ChannelBrowse component.
	function reloadChanList() {
		setMajChanList(!majChanList);
	}

	const [majFriendList, setMajFriendList] = useState<boolean>(false);

	// To call when need to refresh ChannelBrowse component.
	function reloadFriendList() {
		setMajFriendList(!majFriendList);
	}

	const myId: number = getAccessContent()?.userId as number;

	async function fetchMe() {
		const getMyUsername: string = (await ApiClient.get('users/profile/' + getAccessContent()?.userId)).data.username;
		setMyUsername(getMyUsername);
	}

	useEffect(() => {
		fetchMe();
	}, [])

	async function fetchUsersOnChan(chanId: number) {
			try {
				const res: UserOnChannelDto[]  = (await ApiClient.get('/channels/users/' + chanId)).data;
				const lala: UserOnChannelDto[] = await Promise.all(res.map(async (uoc) => {
					const username: string = (await ApiClient.get('users/profile/' + uoc.userId)).data.username;
					const channelName: string = (await ApiClient.get('channels/byid/' + uoc.channelId)).data.channelName;
					return ({...uoc, username: username, channelName: channelName});
				}));
				setUsers(lala);
			} catch (error) {
				if (error instanceof AxiosError && error.response) {
					console.error(error.response.data.message);
				} else
					console.error( 'Erreur lors de la récupération des users :', error);
			}
		}

		async function fetchMessages(chanId: number) {
			try {
				const msgsResponse = (
					await ApiClient.get(
						'/channels/messages/' + chanId
					)
				).data;
				const msgs: MessageDto[] = msgsResponse.map(
					(data: any): MessageDto => {
						return {
							creatorId: data.creatorId,
							creatorName: data.createdBy.username,
							content: data.content,
						};
					}
				);
				setMessagesList(msgs);
			} catch (error) {
				if (error instanceof AxiosError && error.response) {
					console.error(error.response.data.message);
				} else
					console.error( 'Erreur lors de la récupération des messages :', error);
			}
		}

	function sendMessage(newMsg: string) {
		if (!newMsg || !newMsg.trim()) return;
		const toSend: socketMsgDto = {
			creatorId: getAccessContent()?.userId as number,
			content: newMsg,
			channelId: selectedChannel?.id as number,
		};
		socket?.emit('newMsg', toSend);
		// socket?.emit('sendMessage', { user: 'Raph', msg: 'Hola! Sur le chan 1', chanId: '1' })
	}

	async function addMsg(newMsg: socketMsgDto) {
		try {
			const username = (await ApiClient.get('users/profile/' + newMsg.creatorId)).data
			.username;
			if (messagesList) {
				setMessagesList([...messagesList,
								{
									creatorId: newMsg.creatorId,
									creatorName: username,
									content: newMsg.content,
								},
				]);
			}
		} catch (e) {
			console.log(e);
		}
	}

	function handleOnBanOrKick(targetId: number, chanId: number) {
		if (targetId !== myId) return ;
		reloadChanList();
		reloadBrowseList();
	}

	useEffect(() => {
		if (!socket) return ;
		// 'catch' toutes les erreurs throw dans le back en gros
        socket?.on('userLeftChan', (chanId: number, userId: number) => {
            reloadUsersList();
          if (userId !== myId)
            return ;
            reloadChanList();
            reloadBrowseList();
		});
		socket?.on('error', (error) => {
							 console.error('Socket error: ', error);
		});
		socket?.on('exception', (error) => {
							 console.error('Socket exception: ', error);
		});
		socket?.on('afterNewMessage', (data: socketMsgDto) => {
			if (selectedChannel && data.channelId === selectedChannel.id) {
				addMsg(data);
			}
		});
		socket.on('rightsEdited', (targetId: number, chanId: number) => {
			if (!selectedChannel || chanId != selectedChannel.id) return ;
			reloadUsersList();
		});
		socket?.on('someoneHasBeenBanned', (targetId: string, chanId: string) => {
			handleOnBanOrKick(+targetId, +chanId);
			reloadUsersList();
		});
		socket?.on('someoneHasBeenKicked', (targetId: string, chanId: string) => {
			handleOnBanOrKick(+targetId, +chanId);
			reloadUsersList();
		});
		socket.on('chanEdited', (chanId: number) => {
			reloadChanList();
			reloadBrowseList();
		});
		socket.on('friendListEdited', () => {
			reloadFriendList();
		})
		socket?.on('someoneJoinedRoom', (chanId: number, userId: number) => {
			if (userId !== myId) {
				if (selectedChannel && selectedChannel.id === chanId)
					reloadUsersList();
				return ;
			}
			reloadChanList();
			reloadBrowseList();
		});
		return () => {
			socket?.off('someoneJoinedRoom');
			socket?.off('rightsEdited');
			socket?.off('error');
			socket?.off('exception');
			socket?.off('afterNewMessage');
			socket?.off('someoneHasBeenBanned');
			socket?.off('someoneHasBeenKicked');
			socket?.off('userLeftChan');
		};
	});

	function reloadUsersList() {
		if (!selectedChannel) return ;
		fetchUsersOnChan(selectedChannel.id);
	}

	// En fait pas besoin d'un useEffect!!! Ca faisait que des pbs, car le useEffect est
	// declenche APRES un re-render, et bref, le users state etait tjrs en retard d'un 
	// render du coup. Faut juste faire cette fonction qui gere la logique lors d'un
	// changement de selected channel. Faudrait limite rendre interdit l'utilisation
	// de setSelectedChannel en dehors de cette fct. Ceci car evidemment il faut maj
	// la liste de msg et de usersonchan en fct du selectedChannel.
	function handleSelectChannel(chan: ChannelDto | undefined) {
		setSelectedChannel(chan);
		if (chan) {
			fetchMessages(chan.id);
			fetchUsersOnChan(chan.id);
		} else {
			setMessagesList(undefined);
			setUsers(undefined);
		}
	}

	return (
		<Box sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }} >
			{ socket  ? 
				<Paper className="chat" >
					<Box  className="channelList">
						<ChannelList
							selectedChannel={selectedChannel}
							channelList={channelList}
							setChannelList={setChannelList}
							handleSelectChannel={handleSelectChannel}
							isOwner={users?.find((uoc) => (uoc.userId === myId && (uoc.role === 'CREATOR' || uoc.role === 'ADMIN'))) ? true : false}
							majBrowseList={majBrowseList}
							reloadBrowseList={reloadBrowseList}
							majChanList={majChanList}
							majFriendList={majFriendList}
							reloadChanList={reloadChanList}
							myUsername={myUsername}
						/>
					</Box>
					<Divider orientation='vertical' />
					<Box className="chatBox">
						{	selectedChannel && messagesList && users ? 
							<ChatRoom
								selectedChannel={selectedChannel}
								messagesList={messagesList}
								usersList={users}
								sendMessage={sendMessage}
								fetchMessages={fetchMessages}
							/>
							: null
						}
					</Box>
				</Paper>
				: <CircularProgress/> }
		</Box>
	);
}
