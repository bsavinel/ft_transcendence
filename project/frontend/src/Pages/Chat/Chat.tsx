import {ChatSocketContext} from '../../Component/Chat/ChatSocketContext';
import { useState, useEffect, useContext } from 'react';
import ChannelList from '../../Component/Chat/ChannelList';
import ChatRoom from '../../Component/Chat/ChatRoom';
import { MessageDto, ChanelDto } from '../../Component/Chat/hardCodedValues';
import '../../Component/Chat/chat.css';
import ApiClient, { getAccessContent } from '../../utils/ApiClient';
import ChanSettings from '../../Component/Chat/ChanSettings';
import { AxiosError } from 'axios';

interface socketMsgDto {
	creatorId: number;
	content: string;
	channelId: number;
}

export interface createChannelDto {
	channelName: string;
	mode: string;
	password?: string;
}

export default function Chat() {
	const socket = useContext(ChatSocketContext);
	//TODO: verifier partout si 0 channel (message list aussi)
	const [channelList, setChannelList] = useState<ChanelDto[]>([]);
	const [messagesList, setMessagesList] = useState<MessageDto[]>([]);
	const [selectedChannel, setSelectedChannel] = useState<ChanelDto | null>(
		null
	);

	// For chan settings modal
	const [openEditChan, setOpenEditChan] = useState(false);
	const handleEditChanOpen = () => setOpenEditChan(true);
	const handleEditChanClose = () => setOpenEditChan(false);

	// For now, use the HTTP method to create a channel. To Replace with websocket (to annouce everyone)
	async function addChan(name: string, mode: string, pass: string) {
		const newChan: createChannelDto = {
			channelName: name,
			password: pass,
			mode: mode,
		};
		try {
			const res = await ApiClient.post('/channels', newChan);
			const createdChan: ChanelDto = {
				id: res.data.id,
				name: res.data.channelName,
			};
			setChannelList([...channelList, createdChan]);
			setSelectedChannel(createdChan);
		} catch (error) {
			console.log('Error while creating new channel: ' + error);
			if (error instanceof AxiosError && error.response) {
				console.log(error.response.data.message);
			}
			throw error;
		}
		setOpenEditChan(false);
	}

	async function fetchChannels() {
		console.log('fetching Channels list');
		try {
			const subChanRes = (await ApiClient.get('/channels')).data;
			const chans: ChanelDto[] = subChanRes.map(
				(data: any): ChanelDto => {
					return { id: data.id, name: data.channelName };
				}
			);
			setChannelList(chans);
		} catch (error) {
			console.error(
				'Erreur lors de la récupération des suscribedChannelsList :',
				error
			);
			if (error instanceof AxiosError && error.response) {
				console.log(error.response.data.message);
			}
		}
	}

	// Appelle lors du (re)chargement de la page. Sert a lister la liste des channels suscribed par le user.
	useEffect(() => {
		fetchChannels();
	}, []); // Utilise un tableau vide pour s'assurer que l'effet ne se déclenche qu'une seule fois lors du montage du composant

	// Pour render la ChatRoom (la liste des messages) en fonction de du selected chan. Si aucun chan est selected,
	// alors on efface la liste de message.
	useEffect(() => {
		async function fetchMessages() {
			console.log('fetching Messages list');
			try {
				const msgsResponse = (
					await ApiClient.get(
						'/channels/messages/' + selectedChannel?.id
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
				console.error(
					'Erreur lors de la récupération des messages :',
					error
				);
				if (error instanceof AxiosError && error.response) {
					console.log(error.response.data.message);
				}
			}
		}

		if (selectedChannel) {
			fetchMessages();
		} else {
			setMessagesList([]);
		}
	}, [selectedChannel]);

	function sendMessage(newMsg: string) {
		if (!newMsg || !newMsg.trim()) return;
		const toSend: socketMsgDto = {
			creatorId: getAccessContent()?.userId as number,
			content: newMsg,
			channelId: selectedChannel?.id as number,
		};
		socket?.emit('newMsg', toSend);
	}

	async function addMsg(newMsg: socketMsgDto) {
		const username = (await ApiClient.get('users/' + newMsg.creatorId)).data
			.username;
		setMessagesList([
			...messagesList,
			{
				creatorId: newMsg.creatorId,
				creatorName: username,
				content: newMsg.content,
			},
		]);
	}

	useEffect(() => {
		socket?.on('connect', () => console.log('Connected from chatroom'));
		socket?.on('afterNewMessage', (data: socketMsgDto) => {
			console.log('new msg received: ' + data);
			addMsg(data);
		});
		return () => {
			socket?.off('connect');
			socket?.off('afterNewMessage');
		};
	});

	return (
		<div className="joiner">
			<ChanSettings
				openEditChan={openEditChan}
				handleEditChanClose={handleEditChanClose}
				addChan={addChan}
			/>
			<div className="chanelLayoutSimu">
				<ChannelList
					channelList={channelList}
					setChannelList={setChannelList}
					selectedChannel={selectedChannel}
					setSelectedChannel={setSelectedChannel}
					handleEditChanOpen={handleEditChanOpen}
				/>
			</div>
			<div className="chatBox">
				<ChatRoom
					messagesList={messagesList}
					sendMessage={sendMessage}
					inputDisabled={selectedChannel ? false : true}
				/>
			</div>
		</div>
	);
}
