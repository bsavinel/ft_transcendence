import { Button, ButtonGroup, List, ListItem, ListItemButton, ListItemText, ListSubheader } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import './ChannelList.css';
import { ChanelDto } from './hardCodedValues';
import ApiClient, { getAccessContent } from '../../utils/ApiClient';
import { AxiosError } from 'axios';
import ChannelBrowse from './ChannelBrowse/ChannelBrowse';

interface ChanListProps {
    channelList: ChanelDto[];
    setChannelList: (data: any) => void;
    selectedChannel: ChanelDto | null;
    setSelectedChannel: (data: any) => void;
    handleEditChanOpen: () => void;
}

export default function ChannelList({channelList, setChannelList, selectedChannel, setSelectedChannel, handleEditChanOpen}: ChanListProps) {

    async function handleClickDelChan() {
        console.log('deleting CHANKJ');
        try {
            await ApiClient.delete('channels/' + selectedChannel?.id);
            const majChan = channelList.filter(chan => chan.id !== selectedChannel?.id );
            setChannelList(majChan);
            setSelectedChannel(null);
        } catch (error) {
            console.log('Error while creating new channel: ' + error);
            if (error instanceof(AxiosError) && error.response) {
                console.log(error.response.data.message);
            }
        }
    }

    //TODO: comment enlever ces warning sur les undefined???
    const myId: number = getAccessContent()?.userId;
    const channelItems = channelList?.map((data: ChanelDto) =>
        <ListItemButton
            onClick={() => handleSelectChan(data)}
            selected={selectedChannel?.id===data.id}
            key={data.id}
        >
            <ListItem divider>
                <ListItemText primary={data.name}/>
                <Button sx={{color: 'red'}} disabled={selectedChannel?.id!==data.id}>
                    <ClearIcon onClick={handleClickDelChan}/>
                </Button>
            </ListItem>
        </ListItemButton>
    );

    async function leaveChan() {
        await ApiClient.delete('channels/leave/' + selectedChannel?.id);
        var chanLst = channelList.filter(function(e: ChanelDto) { return e.id !== selectedChannel?.id });
        setChannelList(chanLst);
        setSelectedChannel(null);
    }

    // Set the selected index channel, triggered on mouse click.
    function handleSelectChan(chan: ChanelDto){
        setSelectedChannel(chan);
    }

    return (
        <div className='chanListContainer'>
            <List className='list' sx={{padding:0}}>
                <ListSubheader sx={{backgroundColor: 'grey'}}>
                    Channels
                </ListSubheader>
                {channelItems}
                <ListSubheader>
                    Friends
                </ListSubheader>
				<ChannelBrowse />
            </List>
            <ButtonGroup className='actionButtons' variant='contained' size='small'>
                <Button id='addBtn' onClick={handleEditChanOpen}>
                    <AddIcon/>
                </Button>
                <Button id='leaveChan' onClick={selectedChannel ? leaveChan : undefined}>
                    <RemoveIcon/>
                </Button>
            </ButtonGroup>
        </div>
    );
}
