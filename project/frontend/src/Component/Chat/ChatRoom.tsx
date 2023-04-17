import TextField from '@mui/material/TextField'; import { Box, Button, Chip , Avatar, } from '@mui/material';
import { StyledEngineProvider } from '@mui/material/styles';
import { MessageDto } from './hardCodedValues';
import './ChatRoom.css';
import { useEffect, useRef, useState } from 'react';
import SendIcon from '@mui/icons-material/Send';
import { getAccessContent } from '../../utils/ApiClient';

// TODO: pour mettre avatar du user: avatar={<Avatar src={`${data.user.pathToAvatar}}></Avatar>}

// Permet de typer les props du ChatRoom component, et pas passer un
// simple 'props'.
interface ChatRoomProps {
    messagesList: MessageDto[] | undefined;
    sendMessage: (msg: string) => void;
    inputDisabled: boolean;
}

export default function ChatRoom({ messagesList, sendMessage, inputDisabled }: ChatRoomProps) {

    const [newMsg, setNewMsg] = useState('');

    //TODO: comment enlever ces warning sur les undefined???
    const myId: number = getAccessContent()?.userId as number;

    // PB CSS qui marche une fois sur 15 resolu
    // https://mui.com/material-ui/guides/interoperability/#css-injection-order-2
    const chipData = messagesList?.map((data: MessageDto, index: number) =>
        <StyledEngineProvider injectFirst key={index}>
            <Chip
                id={`${data.creatorId === myId ? 'send' : 'received'}`}
                className='messages'
                label={data.content}
                avatar={
                    <Avatar id='msgAvatar'>
                        {data.creatorId}
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
     }, [messagesList])

	return (
		<Box id='chatRoom'>
            <div ref={chatRef} className='messageDisplay'>
                {chipData}
            </div>

            <TextField
                disabled={inputDisabled}
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
