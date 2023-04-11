import {socket} from '../../Component/Chat/ChatSocketContext';
import { useState, useEffect } from 'react';
import ChannelList from '../../Component/Chat/ChannelList';
import ChatRoom from '../../Component/Chat/ChatRoom';
import { MessageDto, ChanelDto } from '../../Component/Chat/hardCodedValues';
import '../../Component/Chat/chat.css';
import ApiClient, { getAccessContent } from '../../utils/ApiClient';

interface socketMsgDto {
    creatorId: number;
    content: string;
    channelId: number;
}
/*
 * Returns (if resolved) a list of channels.
 */
async function fetchChannels(): Promise<ChanelDto[]> {
    try {
        const subChanRes = (await ApiClient.get('/channels')).data;
        const chans: ChanelDto[] = subChanRes.map((data: any): ChanelDto => {
            return {id: data.id, name: data.channelName};
        });
        return chans;
    } catch (error) {
        console.error('Erreur lors de la récupération des suscribedChannelsList :', error);
    }
    return [];
};

/*
 * Returns (if resolved) a list of messages for the provided channel identified by its id.
 */
async function fetchMessages(chanId: number): Promise<MessageDto[]> {
    try {
        const msgsResponse = (await ApiClient.get('/messages/fromchan/' + chanId)).data;
        const msgs: MessageDto[] = msgsResponse.map((data: any): MessageDto => {
            return {creatorId: data.creatorId, creatorName: data.createdBy.username, content: data.content};
        });
        return msgs;
    } catch (error) {
        console.error('Erreur lors de la récupération des messages :', error);
    }
    return [];
};

export default function Chat() {
    //TODO: verifier partout si 0 channel (message list aussi)
    const [channelList, setChannelList] = useState<ChanelDto[]>([]);
    const [messagesList, setMessagesList] = useState<MessageDto[]>([]);
    const [selectedChannel, setSelectedChannel] = useState<ChanelDto | null>(null);

    useEffect(() => {
        fetchChannels()
            .then((chans) => {
                setChannelList(chans ?? []); }) .catch((error) => {
                console.error('Erreur lors de la récupération des suscribedChannelsList :', error);
            });
    }, []); // Utilise un tableau vide pour s'assurer que l'effet ne se déclenche qu'une seule fois lors du montage du composant

    useEffect(() => {
        selectedChannel && fetchMessages(selectedChannel.id)
            .then((msgs) => {
                console.log('Setting messages');
                setMessagesList(msgs);
            })
    }, [selectedChannel]);

    function sendMessage(newMsg: string) {
         if (!newMsg || !newMsg.trim()) return;
         const toSend: socketMsgDto = {creatorId: getAccessContent()?.userId, content: newMsg, channelId: selectedChannel?.id};
         socket.emit('newMsg', toSend);
     };

     async function addMsg(newMsg: socketMsgDto) {
         const username = (await ApiClient.get('users/' + newMsg.creatorId)).data.username;
         setMessagesList([
             ...messagesList,
             //TODO: faut mettre le name du gars
             {creatorId: newMsg.creatorId, creatorName: username, content: newMsg.content}
         ]);
     };

     useEffect(() => {
         socket.once('connect', () => console.log('Connected from chatroom'));
         socket.once('afterNewMessage', (data: socketMsgDto) => {
             console.log('new msg received: ' + data);
             addMsg(data);
            }
         );
     });

    return (
        <div className='joiner'>
            <div className='chanelLayoutSimu'>
                <ChannelList
                    channelList={channelList}
                    setChannelList={setChannelList}
                    selectedChannel={selectedChannel}
                    setSelectedChannel={setSelectedChannel}
                />
            </div>
            <div className='chatBox'>
                <ChatRoom
                    messagesList={messagesList}
                    sendMessage={sendMessage}
                    inputDisabled={selectedChannel ? false : true}
                />
            </div>
        </div>
    );
}
