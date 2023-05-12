import { Collapse, Badge, Button, ButtonGroup, List, ListItem, ListItemButton, ListItemText, Snackbar, Alert, Divider, Box } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import './ChannelList.css';
import ApiClient, {getAccessContent} from '../../utils/ApiClient';
import { AxiosError } from 'axios';
import ChannelBrowse from './ChannelBrowse/ChannelBrowse';
import FriendList from './FriendList/FriendList';
import {Dispatch, SetStateAction, useContext, useEffect, useState} from 'react';
import AddChanDialog from './AddChan/AddChanDialog';
import {ExpandLess, ExpandMore} from '@mui/icons-material';
import {Socket} from 'socket.io-client';
import {ChatSocketContext} from './ChatSocketContext';
import EditChan from './EditChan/EditChan';
import NotificationList from '../Notification/NotificationList';
import {ChannelDto, createChannelDto, FriendListDto} from './interfaces';

interface ChanListProps {
    selectedChannel: ChannelDto | undefined;
    channelList: ChannelDto[];
    setChannelList: (chans: ChannelDto[]) => void;
    handleSelectChannel: (chanList: ChannelDto | undefined) => void;
    isOwner: boolean;
    majBrowseList: boolean;
    reloadBrowseList: () => void;
    majChanList: boolean;
    reloadChanList: () => void;
    myUsername: string;
};

export default function ChannelList({ selectedChannel, channelList, setChannelList, handleSelectChannel, isOwner, majBrowseList, reloadBrowseList, majChanList, reloadChanList, myUsername }: ChanListProps) {
	const [browseChanList, setBrowseChanList] = useState<ChannelDto[]>();
	const [isAddChanOpen, setIsAddChanOpen] = useState(false);
	const [isEditChanOpen, setEditChanOpen] = useState(false);
	const [openCollapse, setOpenCollapse] = useState<boolean>(false);
	const [openDialog, setOpenDialog] = useState<boolean>(false);
	const [userFriends, setUserFriends] = useState<FriendListDto[]>([]);
	const [error, setError] = useState<string | undefined>(undefined);
    const socket: Socket | null = useContext(ChatSocketContext);
	const myId: number = getAccessContent()?.userId as number;

    async function handleClickDelChan() {
        if (!selectedChannel)
            return ;
        try {
            await ApiClient.delete('channels/' + selectedChannel?.id);
            socket?.emit('chanDeleted', selectedChannel.id);
        } catch (error) {
            if (error instanceof AxiosError && error.response) {
                console.error(error.response.data.message);
                setError(error.response.data.message);
                return ;
            }
            setError('An error occured while deleting chan.');
        }
    }

	async function fetchChannels() {
		console.debug('fetching Channels list');
		try {
			const subChanRes: ChannelDto[] = (await ApiClient.get('/channels')).data.filter((data:ChannelDto) => data.mode !== 'DIRECT');
        setChannelList(subChanRes);
        if (selectedChannel && selectedChannel.mode !== 'DIRECT') {
            const found: ChannelDto | undefined = subChanRes.find((chan) => chan.id === selectedChannel.id);
            if (!found)
                handleSelectChannel(undefined);
            else if (found !== selectedChannel)
                handleSelectChannel(found);
        }
		} catch (error) {
            if (error instanceof AxiosError && error.response) {
                console.error(error.response.data.message);
                setError(error.response.data.message);
                return ;
            }
            setError('An error occured while fetching channels.');
		}
	}

    useEffect(() => {
        fetchUserFriends();
    }, []);

	async function fetchUserFriends() {
		try {
			const getUserFriends = await ApiClient.get('users/profile/' + getAccessContent()?.userId + '?friend=true');
			setUserFriends(getUserFriends.data.friends);
		} catch (error) {
            if (error instanceof AxiosError && error.response) {
                console.error(error.response.data.message);
                setError(error.response.data.message);
                return ;
            }
            setError('An error occured while fetching friends.');
		}
	}
    // Fonction qui RM au hook channelList le channel identifie par chandId (ne fait
    // PAS de call au back)
    function rmFromChanList(chanId: number) {
        var chanLst: ChannelDto[] = channelList.filter((e: ChannelDto) => e.id !== chanId );
        setChannelList(chanLst);
        if (chanId === selectedChannel?.id)
            handleSelectChannel(undefined);
    }

    // Fonction qui ADD au hook channelList le channel identifie par chandId (ne fait
    // PAS de call au back)
    function addToChanList(chan: ChannelDto) {
			setChannelList([...channelList, chan]);
			handleSelectChannel(chan);
    }



	// Appelle lors du (re)chargement de la page. Sert a lister la liste des channels suscribed par le user.
	useEffect(() => {
		fetchChannels();
	}, [majChanList]); // Utilise un tableau vide pour s'assurer que l'effet ne se déclenche qu'une seule fois lors du montage du composant


    const channelItems = channelList?.map((data: ChannelDto) =>
        <ListItemButton
            onClick={data.id === selectedChannel?.id ? undefined : () => handleSelectChannel(data)}
            selected={selectedChannel?.id===data.id}
            key={data.id}
        >
                <ListItem id='chanListItems'>
                    <ListItemText primary={data.channelName}/>
                </ListItem>
        </ListItemButton>
    );

    async function leaveChan() {
        if (!selectedChannel)
            return ;
          try {
            await ApiClient.delete('channels/leave/' + selectedChannel.id);
            socket?.emit('userLeftChan', selectedChannel.id);
          } catch(error) {
            if (error instanceof AxiosError && error.response) {
                console.error(error.response.data.message);
                setError(error.response.data.message);
                return ;
            }
            setError('An error occured while leaving chan.');
          }
    }

    async function addChan(name: string, mode: string, pass: string): Promise<ChannelDto> {
		const newChan: createChannelDto = {
			channelName: name,
			password: pass,
			mode: mode,
		};
        try {
            const res: ChannelDto = (await ApiClient.post('/channels', newChan)).data;
            socket?.emit('chanCreated', res.id);
            handleSelectChannel(res);
            setIsAddChanOpen(false);
            return res;
        } catch (error) {
            if (error instanceof AxiosError && error.response) {
                console.error(error.response.data.message);
                setError(error.response.data.message.join(" | "));
            }
            setError('An error occured while creating chan.');
            return Promise.reject();
        }
	}

    useEffect(() => {
		socket?.on('chanCreated', (chanId: number) => {
            reloadChanList();
            reloadBrowseList();
		});
		socket?.on('chanDeleted', (chanId: number) => {
            reloadChanList();
            reloadBrowseList();
		});
		return () => {
			socket?.off('chanCreated');
			socket?.off('chanDeleted');
		};
    });

	return (
      <Box className='chanListContainer'>
          <List id='listMUI' sx={{ height: '100%' }} >
              <ListItemButton onClick={() => setOpenCollapse(!openCollapse)} divider={true}>
                  <ListItemText primary="Channels"/>
                  {openCollapse ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              <Collapse in={openCollapse} timeout='auto' unmountOnExit>
                  {channelItems}
              </Collapse>
              <FriendList 
                  addChan={addChan}
                  userFriends={userFriends}
                  handleSelectChannel={handleSelectChannel}
              />
              <ChannelBrowse 
                  addToChanList={addToChanList} 
                  browseChanList={browseChanList} 
                  setBrowseChanList={setBrowseChanList} 
                  majBrowseList={majBrowseList}
              />
          </List>
          {isAddChanOpen ? 
              <AddChanDialog
                  isOpen={isAddChanOpen}
                  closeModal={() => setIsAddChanOpen(false)}
                  addChan={addChan}
                  handleDialog={() => setOpenDialog(!openDialog)}
                  userFriends={userFriends}
                  myUsername={myUsername}
              />
          : null}
          {selectedChannel && isEditChanOpen ?
              <EditChan
                  isOpen={isEditChanOpen}
                  closeDialog={() => setEditChanOpen(false)}
                  selectedChannel={selectedChannel} /> 
                  : null }
          <Divider />
          <ButtonGroup sx={{flexShrink: '0'}} className='actionButtons' variant='contained' size='small'>
              <Button id='addBtn' onClick={() => setIsAddChanOpen(true)}>
                  <AddIcon/>
              </Button>
              <Button id='leaveChan' onClick={leaveChan} disabled={selectedChannel && selectedChannel.mode !== 'DIRECT' ? false : true}> <RemoveIcon/>
              </Button>
              <Button id='deleteChan' onClick={handleClickDelChan} disabled={selectedChannel && selectedChannel.mode !== 'DIRECT' && isOwner ? false : true } >
                  <ClearIcon />
              </Button>
              <Button id='editChan' onClick={() => setEditChanOpen(true)} disabled={selectedChannel && selectedChannel.mode !== 'DIRECT' && isOwner ? false : true } >
                  <SettingsIcon/>
              </Button>
          </ButtonGroup>
          <Snackbar open={error ? true : false} autoHideDuration={6000} onClose={() => setError(undefined)}>
              <Alert severity="error">{error}</Alert>
          </Snackbar>
      </Box>
  );
}
