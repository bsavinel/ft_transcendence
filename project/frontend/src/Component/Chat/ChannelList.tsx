import { Button, ButtonGroup, List, ListItem, ListItemButton, ListItemText, ListSubheader } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import './ChannelList.css';

import { ChanelDto } from './hardCodedValues';

export default function ChannelList(props: any) {
    const channelItems = props.channelList.map((data: ChanelDto) =>
        <ListItemButton
            onClick={() => handleSelectChan(data)}
            selected={props.selectedChannel===data}
            key={data.id}
        >
            <ListItem divider>
                <ListItemText primary={data.name}/>
            </ListItem>
        </ListItemButton>
    );

    function addChan(){
        // to replace by new chan backend created id
        const lastId = props.channelList.slice(-1)[0].id;
        const newChan: ChanelDto = { name: 'NEW CHAN', id: lastId + 1, messages: [], owner: 'Me', admins: ['Me']};
        props.setChannelList([...props.channelList, newChan]);
        // select the new chan
        props.setSelectedChannel(newChan);
    }

    function delChan() {
        var chanLst = props.channelList.filter(function(e: ChanelDto) { return e.id !== props.selectedChannel.id });
        props.setChannelList(chanLst);
        props.setSelectedChannel(chanLst[0]);
    }

    // Set the selected index channel, triggered on mouse click.
    function handleSelectChan(chan: ChanelDto){
        props.setSelectedChannel(chan);
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
                {/* Only available if the user is the chan owner */}
                <Button id='editBtn' onClick={e => props.selectedChannel.owner === 'Me' ? props.handleEditChanOpen() : e.preventDefault()}>
                    <EditIcon />
                </Button>
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
