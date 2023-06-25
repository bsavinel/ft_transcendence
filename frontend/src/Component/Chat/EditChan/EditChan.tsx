import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, InputAdornment, MenuItem, Stack, TextField } from '@mui/material';
import { useContext, useRef, useState } from 'react';
import {VisibilityOff} from '@mui/icons-material';
import Visibility from '@mui/icons-material/Visibility';
import ApiClient from '../../../utils/ApiClient';
import {AxiosError} from 'axios';
import { Socket } from 'socket.io-client';
import { ChatSocketContext } from '../ChatSocketContext';
import {ChannelDto} from '../interfaces';

interface EditChanProps {

	isOpen: boolean
	closeDialog: () => void;
	selectedChannel: ChannelDto;
}

/*
 * Permet de changer/supprimer/ajouter un password au channel.
 * Permet de ban/kick/mute les users presents dans le channel (only available to
 * creator and admin. ATTENTION le creator ne doit pas etre kickable/bannable/mutable)
 */
export default function EditChan({isOpen, closeDialog, selectedChannel }: EditChanProps) {
	const passwordRef = useRef<HTMLInputElement>();
	const [choosenMode, setChoosenMode] = useState<string>(selectedChannel.mode);
	const [showPassword, setShowPassword] = useState<boolean>(false);
	const [error, setError] = useState<string | undefined>(undefined);
    const socket: Socket | null = useContext(ChatSocketContext);

	const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
	};

	function handleCloseDialog() {
		if (passwordRef.current)
			passwordRef.current.value = '';
		setError(undefined);
		setShowPassword(false);
		closeDialog();
	}

	async function handleSubmit(e: React.MouseEvent<HTMLButtonElement>) {
		e.preventDefault();
		try {
			await ApiClient.patch('channels/' + selectedChannel.id, {mode: choosenMode, password: passwordRef.current?.value});
			socket?.emit('chanEdited', selectedChannel.id);
			handleCloseDialog();
		} catch(error) {
            if (error instanceof AxiosError && error.response) {
                console.error(error.response.data.message);
                setError(error.response.data.message);
                return ;
            }
            setError('An error occured while editing chan.');
		}
	}

	return (
		<div>
			<Dialog open={isOpen} onClose={handleCloseDialog} sx={{boxSizing: 'initial'}} >
				<DialogTitle>Channel {selectedChannel.channelName} settings</DialogTitle>
				<Divider/>
				<DialogContent>
					<Stack direction='row' spacing={2} >
						<TextField select label='Select mode' value={choosenMode} onChange={(e) => setChoosenMode(e.target.value)} variant='standard' sx={{mt: '10px'}}>
							<MenuItem key='PUBLIC' value='PUBLIC'>PUBLIC</MenuItem>
							<MenuItem key='PROTECTED' value='PROTECTED'>PROTECTED</MenuItem>
						</TextField>
					</Stack>
					{ choosenMode === 'PROTECTED' ? 
						<TextField id="newPassword"
							label={error ? error : "Set new password"}
							variant='standard'
							sx={{mt: '10px'}}
							inputRef={passwordRef}
							type={showPassword ? 'text' : 'password'} 
							error={!!error}
							fullWidth 
							InputProps={{endAdornment: 
								<InputAdornment position="end">
									<IconButton
										onClick={() => setShowPassword(!showPassword)}
										onMouseDown={handleMouseDownPassword}
										edge="end"
									>
										{showPassword ? <VisibilityOff /> : <Visibility />}
									</IconButton>
								</InputAdornment>
							}}
						/>
						: null
					}
				</DialogContent>
				<Divider/>
				<DialogActions>
					<Button variant='contained' color='error' onClick={handleCloseDialog} >
						Cancel
					</Button>
					<Button type="submit" variant='contained' onClick={handleSubmit} >
						Submit
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
}
