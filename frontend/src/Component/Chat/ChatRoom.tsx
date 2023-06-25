import TextField from '@mui/material/TextField'; import { Avatar, Box, Button, Chip, Collapse, Divider, StyledEngineProvider, Tooltip } from '@mui/material';
import './ChatRoom.css';
import { useEffect, useRef, useState } from 'react';
import SendIcon from '@mui/icons-material/Send';
import {getAccessContent} from '../../utils/ApiClient';
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
}



export default function ChatRoom({ selectedChannel, messagesList, usersList, sendMessage }: ChatRoomProps) {
    const [openUL, setOpenUL] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>();
    const myId: number = getAccessContent()?.userId as number;

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
                        src={
                            `${import.meta.env.VITE_BACK_URL}/users/avatar/${data.creatorId}`
                        }
                    >
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


	return (
		<Box id='chatRoomContainer'>
            <Box id='chatRoom'>
                <div ref={chatRef} className='messageDisplay'>
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
                            <UsersList selectedChannel={selectedChannel}  usersList={usersList}/>
                        </Box>
                    </Collapse>
                </Box>
            </Box>
        </Box>
	);
}
