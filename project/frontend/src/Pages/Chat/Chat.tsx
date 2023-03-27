// Chat room related stuff
import { useState } from 'react';
import ChannelList from '../../Component/Chat/ChannelList';
import ChatRoom from '../../Component/Chat/ChatRoom';
import { MessageDto, ChanelDto, hardCodeChannelList } from '../../Component/Chat/hardCodedValues';
import '../../Component/Chat/chat.css';
import ChanSettings from '../../Component/Chat/ChanSettings';

export default function Chat() {
    //TODO: verifier partout si 0 channel (message list aussi)
    const [channelList, setChannelList] = useState<ChanelDto[]>(hardCodeChannelList);
    const [selectedChannel, setSelectedChannel] = useState(channelList[1]);
    // For chan settings modal
    const [openEditChan, setOpenEditChan] = useState(false);
    const handleEditChanOpen = () => setOpenEditChan(true);
    const handleEditChanClose = () => setOpenEditChan(false);

    function changeChanName(e: any) {
        if (!e.target.value || !e.target.value.trim())
        {
            return ;
        }
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            selectedChannel.name = e.target.value;
            setOpenEditChan(false);
        }
    }

    // https://react.dev/learn/updating-arrays-in-state#updating-objects-inside-arrays:~:text=You%20can%20use%20map%20to%20substitute%20an%20old%20item%20with%20its%20updated%20version%20without%20mutation.
    function sendMessage(newMsg: string) {
         if (!newMsg || !newMsg.trim()) return;
         const newMsgList: MessageDto[] = [
             ...selectedChannel.messages,
             {user: 'Me', message: newMsg}
         ];
         setChannelList(channelList.map(chan => {
             if (chan === selectedChannel) {
                 const chanMaj = {...chan, messages: newMsgList};
                 setSelectedChannel(chanMaj);
                 return chanMaj;
             }
             else {
                 return chan;
             }
         }));
     }

    return (
        <div className='joiner'>
            <ChanSettings
                openEditChan={openEditChan}
                handleEditChanClose={handleEditChanClose}
                changeChanName={changeChanName}
            />
            <div className='chanelLayoutSimu'>
                <ChannelList
                    channelList={channelList}
                    setChannelList={setChannelList}
                    selectedChannel={selectedChannel}
                    setSelectedChannel={setSelectedChannel}
                    handleEditChanOpen={handleEditChanOpen}
                />
            </div>
            <div className='chatBox'>
                <ChatRoom
                    selectedChannel={selectedChannel}
                    sendMessage={sendMessage}
                />
            </div>
        </div>
    );
}
