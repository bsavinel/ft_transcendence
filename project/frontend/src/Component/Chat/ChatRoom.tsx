import TextField from '@mui/material/TextField'; import { Avatar, Box, Button, Chip, Collapse, Divider, StyledEngineProvider, Tooltip } from '@mui/material';
import './ChatRoom.css';
import { useContext, useEffect, useRef, useState } from 'react';
import SendIcon from '@mui/icons-material/Send';
import UserOptions from './UserOptions';
import {getAccessContent} from '../../utils/ApiClient';
import { ChatSocketContext } from './ChatSocketContext';
import UsersList from './UsersList';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import {ChannelDto, MessageDto, UserOnChannelDto} from './interfaces';

// TODO: pour mettre avatar du user: avatar={<Avatar src={`${data.user.pathToAvatar}}></Avatar>}

// Permet de typer les props du ChatRoom component, et pas passer un
// simple 'props'.
interface ChatRoomProps {
    selectedChannel: ChannelDto;
    messagesList: MessageDto[];
    usersList: UserOnChannelDto[];
    sendMessage: (msg: string) => void;
    fetchMessages: (chanId: number) => Promise<void>;
}



export default function ChatRoom({ selectedChannel, messagesList, usersList, sendMessage, fetchMessages }: ChatRoomProps) {
    const [anchorEl, setAnchorEl] = useState<undefined | HTMLElement>();
    const [openUL, setOpenUL] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>();
    const socket = useContext(ChatSocketContext);
    const myId: number = getAccessContent()?.userId as number;
    const myRole: string | undefined = usersList.find((uoc) => uoc.userId === myId)?.role;


    function displayOpts(e: React.MouseEvent<HTMLElement | undefined>) {
        setAnchorEl(anchorEl ? undefined : e.currentTarget);
    }

    // Option must be of: 'ban' / 'kick' / 'mute' / 'block' / 'friend'
    function handleClickOptions(option: string) {
        // on emit un ban
        if (!anchorEl || !selectedChannel) return ;
        const targetId = anchorEl.textContent;
        if (!targetId) return ;
        if (option === 'block') { // juste parceque pas le meme nombre de parametres  :S
            socket?.emit('block', targetId, () => {
                fetchMessages(selectedChannel.id)
            });
        } else if (option === 'friend') {
			const invitation = [{
				type: "FRIEND",
				friendId: getAccessContent()?.userId,
				invitedUsers: Number(targetId),
			}];
			//FIXME
			//pass username props from Chat PAGE
			socket?.emit('newInvit', {invit: invitation, user: "raph"});
        } else {
            if (option === 'admin') {
                socket?.emit('changeRights', {targetId: +targetId, chanId: selectedChannel.id});
            }
            socket?.emit(option, {targetId: targetId, chanId: selectedChannel?.id});
        }
        // on ferme l'anchor
        setAnchorEl(undefined);
    }

    function getUserOnChanRole(userId: number) {
        const userFromList: UserOnChannelDto | undefined = usersList.find((usr) => usr.userId === userId);
        if (!userFromList)
            return 'not found';
        return userFromList?.role;
    }

    function getUserOnChan(userId: number): UserOnChannelDto | undefined {
       return usersList.find((usr) => usr.userId === userId);
    }

    // PB CSS qui marche une fois sur 15 resolu
    // https://mui.com/material-ui/guides/interoperability/#css-injection-order-2
    const chipData = messagesList?.map((data: MessageDto, index: number) =>
        <StyledEngineProvider injectFirst key={index}>
            <Tooltip title={getUserOnChan(data.creatorId)?.username} >
            <Chip
                id={`${data.creatorId === myId ? 'send' : 'received'}`}
                className='messages'
                label={data.content}
                avatar={
                    <Avatar id='msgAvatar' 
                        onClick={data.creatorId === myId ? undefined : displayOpts}
                        data-useronchan={JSON.stringify(getUserOnChan(data.creatorId))}
                    >
                        {data.creatorId}
                    </Avatar>
                }
            />
            </Tooltip>
        </StyledEngineProvider>
	);

     // Check wehter the inputTextField keystroke was a enter to send
     // the msg or any other key. (shift+enter to insert newline char)
     function checkEnter(event: any) {
         if (event.key === 'Enter' && !event.shiftKey) {
             event.preventDefault();
            sendMessage(event.target.value)
            event.target.value = '';
         }
     }

     function handleClick() {
         if (inputRef.current) {
             sendMessage(inputRef.current.value);
             inputRef.current.value = '';
         }
     }

     // Used to default scroll into bottom
     const chatRef = useRef<HTMLDivElement | null>(null);
     useEffect(() => {
         if (chatRef.current)
             {
                 chatRef.current.scrollTop = chatRef.current.scrollHeight;
             }
     }, [messagesList])

     function handleCloseMenu() {
         setAnchorEl(undefined);
     }


    function availableActions(): string[] {
        if (!anchorEl) return [];
        if (myRole === 'CREATOR')
            return ['block', 'kick', 'mute', 'ban', 'admin'];
        if (myRole === 'USER')
            return ['block'];
        if (myRole === 'ADMIN') {
            if (anchorEl.dataset.useronchan && JSON.parse(anchorEl.dataset.useronchan).role === 'CREATOR')
                return ['block'];
            return ['block', 'kick', 'mute', 'ban', 'admin'];
        }
        return [];
    }

     console.debug('Chat room mounted');
	return (
		<Box id='chatRoomContainer'>
            <Box id='chatRoom'>
                <div ref={chatRef} className='messageDisplay'>
                    {anchorEl ? 
                        <UserOptions anchorEl={anchorEl}
                            handleClickOptions={handleClickOptions}
                            handleClose={handleCloseMenu}
                            actions={availableActions()} />
                            : null}
                    {chipData}
                </div>

                <TextField
                    id="writeMsg" label="Type your message"
                    multiline maxRows={3} size="small" variant='standard'
                    onKeyDown={checkEnter}
                    inputRef={inputRef}
                    InputProps={{
                        endAdornment:
                            <Button onClick={handleClick}>
                                <SendIcon />
                            </Button>
                    }}
                >
                </TextField>
            </Box>
            <Divider orientation='vertical' />
            <Box className='usersListBox' sx={{ width: openUL ? '25%' : 'fit-content', flexShrink: '0' }} >
                <Button className='expandUL' sx={{minWidth: 'fit-content', padding: '0'}} onClick={() => setOpenUL(!openUL)} >
                    {openUL ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                </Button>
                <Box sx={{width: 'calc(100% - 24px)', maxWidth: 'calc(100% - 24px)', overflowX: 'hidden', marginRight: openUL ? '5px' : '0'}} >
                    <Collapse className='usersListCollapse'  
                        orientation='horizontal' in={openUL} timeout='auto' >
                        <Box className='usersList'>
                            <UsersList usersList={usersList}/>
                        </Box>
                    </Collapse>
                </Box>
            </Box>
        </Box>
	);
}
