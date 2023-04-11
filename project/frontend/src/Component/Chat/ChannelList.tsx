import { Button, ButtonGroup, List, ListItem, ListItemButton, ListItemText, ListSubheader } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import './ChannelList.css';
import { ChanelDto } from './hardCodedValues';
import { getAccessContent } from '../../utils/ApiClient';

interface ChanListProps {
    channelList: ChanelDto[];
    setChannelList: (data: any) => void;
    selectedChannel: ChanelDto | null;
    setSelectedChannel: (data: any) => void;
}

export default function ChannelList({channelList, setChannelList, selectedChannel, setSelectedChannel}: ChanListProps) {
    //TODO: comment enlever ces warning sur les undefined???
    const myId: number = getAccessContent()?.userId;
    const channelItems = channelList?.map((data: ChanelDto) =>
        <ListItemButton
            onClick={() => handleSelectChan(data)}
            selected={selectedChannel===data}
            key={data.id}
        >
            <ListItem divider>
                <ListItemText primary={data.name}/>
            </ListItem>
        </ListItemButton>
    );

    function addChan(){
        // to replace by new chan backend created id
        const lastId = channelList.slice(-1)[0].id;
        const newChan: ChanelDto = { name: 'NEW CHAN', id: lastId + 1};
        setChannelList([...channelList, newChan]);
        // select the new chan
        setSelectedChannel(newChan);
    }

    function delChan() {
        var chanLst = channelList.filter(function(e: ChanelDto) { return e.id !== selectedChannel?.id });
        setChannelList(chanLst);
        setSelectedChannel(chanLst[0]);
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
            </List>
            <ButtonGroup className='actionButtons' variant='contained' size='small'>
                <Button id='addBtn' onClick={addChan}>
                    <AddIcon/>
                </Button>
                <Button id='delBtn' onClick={delChan}>
                    <RemoveIcon/>
                </Button>
            </ButtonGroup>
        </div>
    );
}
