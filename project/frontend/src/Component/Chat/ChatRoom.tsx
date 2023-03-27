import TextField from '@mui/material/TextField';
import { Box, Button, Chip , Avatar, } from '@mui/material';
import { StyledEngineProvider } from '@mui/material/styles';
import { ChanelDto, MessageDto } from './hardCodedValues';
import './ChatRoom.css';
import { useEffect, useRef, useState } from 'react';
import SendIcon from '@mui/icons-material/Send';
import UserOptions from './UserOptions';

// TODO: pour mettre avatar du user: avatar={<Avatar src={`${data.user.pathToAvatar}}></Avatar>}

// Permet de typer les props du ChatRoom component, et pas passer un
// simple 'props'.
interface ChatRoomProps {
    selectedChannel: ChanelDto;
    sendMessage: (msg: string) => void;
}

export default function ChatRoom({ selectedChannel, sendMessage }: ChatRoomProps) {

    const [newMsg, setNewMsg] = useState('');
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    function displayOpts(e: React.MouseEvent<HTMLElement>) {
        setAnchorEl(anchorEl ? null : e.currentTarget);
    }

    // PB CSS qui marche une fois sur 15 resolu
    // https://mui.com/material-ui/guides/interoperability/#css-injection-order-2
    const chipData = selectedChannel.messages.map((data: MessageDto, index: number) =>
        <StyledEngineProvider injectFirst key={index}>
            <Chip
                id={`${data.user === 'Me' ? 'send' : 'received'}`}
                className='messages'
                label={data.message}
                avatar={
                    <Avatar id='msgAvatar' onClick={displayOpts}>
                        {data.user.charAt(0)}
                    </Avatar>
                }
            />
        </StyledEngineProvider>
	);


     // Check wehter the inputTextField keystroke was a enter to send
     // the msg or any other key. (shift+enter to insert newline char)
     function checkEnter(event: any) {
         if (event.key === 'Enter' && !event.shiftKey) {
             event.preventDefault();
            sendMessage(event.target.value)
            setNewMsg('');
         }
     }

     function handleClick() {
         sendMessage(newMsg);
         setNewMsg('');
     }

     // Used to default scroll into bottom
     const chatRef = useRef<HTMLDivElement | null>(null);
     useEffect(() => {
         if (chatRef.current)
             {
                 chatRef.current.scrollTop = chatRef.current.scrollHeight;
             }
     }, [selectedChannel.messages])

	return (
		<Box id='chatRoom'>
            <UserOptions setAnchorEl={setAnchorEl} anchorEl={anchorEl} isOwner={selectedChannel.admins.includes('Me')}/>
            <div ref={chatRef} className='messageDisplay'>
                {chipData}
            </div>

            <TextField
                onChange={(e) => setNewMsg(e.target.value)}
                value={newMsg}
                id="writeMsg" label="Type your message"
                multiline maxRows={3} size="small" variant='outlined'
                onKeyDown={checkEnter}
                InputProps={{
                    endAdornment:
                        <Button onClick={handleClick}>
                            <SendIcon sx={{color: 'var(--bleumoch)'}} />
                        </Button>
                }}
            >
            </TextField>
		</Box>
	);
}
