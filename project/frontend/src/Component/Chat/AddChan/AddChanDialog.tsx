import { Button, ButtonGroup, Dialog, DialogContent, DialogContentText, Grid } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import './AddChanDialog.css';
import AddChanPublic from './public';
import AddChanProtected from './protected';
import AddChanPrivate from './private';
import {ChatSocketContext} from '../ChatSocketContext';
import { AxiosError } from 'axios';
import {ChannelDto, FriendListDto} from '../interfaces';

interface AddChanModalProps {

	isOpen: boolean
	closeModal: () => void;
	addChan: (name: string, mode: string, pass: string) => Promise<ChannelDto>;
	handleDialog: () => void;
	userFriends: FriendListDto[] | undefined;
	myUsername: string;
}

export default function AddChanDialog({isOpen, closeModal, addChan, userFriends, myUsername}: AddChanModalProps) {
	const [name, setName] = useState<string>('');
	const [password, setPassword] = useState<string>('');
	const [whichMode, setWhichMode] = useState<string>('PUBLIC');
	const [error, setError] = useState<string | undefined>(undefined);
	const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
	};
	const handleClickShowPassword = () => setShowPassword((show) => !show);
	const [showPassword, setShowPassword] = useState<boolean>(false);
	const socket = useContext(ChatSocketContext);

	const friendLabels = userFriends?.map((friend) => {
		return { label: friend.username, id: friend.id };
	});
	const [invitList, setInvitList] = useState<{label: string, id: number}[] | undefined>(friendLabels && [friendLabels[0]])

	async function handleSubmit(e: any) {
		e.preventDefault();
		if (!name)
			return ;
		try {
			const newChan = await (addChan(name, whichMode, password));
			if (whichMode === 'PRIVATE') {
				if (invitList) {
					const formatList = invitList.map((invitList) => {
						return { type: 'CHAT', channelId: newChan.id, invitedUsers: invitList.id };
					})
					socket?.emit('newInvit', {invit: formatList, user: myUsername});
				}
			}
		} catch(e) {
            if (e instanceof AxiosError && e.response)  {
                setError(e.response.data.message.join(" | "));
			}
			else
				setError('An error occured');
			console.error(e);
		}
		setName('');
		setPassword('');
	}

	useEffect(() => {
		if (error)
			setTimeout(() => setError(undefined), 2000);
	}, [error])


	function ChoseMode() {
		return (
			<ButtonGroup variant='contained' fullWidth={true}>
				<Button onClick={() => setWhichMode('PUBLIC')} color={whichMode === 'PUBLIC' ? 'success' : 'primary'} >
					PUBLIC
				</Button>
				<Button onClick={() => setWhichMode('PROTECTED')} color={whichMode === 'PROTECTED' ? 'success' : 'primary'} >
					PROTECTED
				</Button>
				<Button onClick={() => setWhichMode('PRIVATE')} color={whichMode === 'PRIVATE' ? 'success' : 'primary'} >
					PRIVATE
				</Button>
			</ButtonGroup>
		);
	}

	function closeDialog() {
		closeModal();
		setName('');
		setPassword('');
	}

	return (
		<div>
			<Dialog
				open={isOpen}
				onClose={closeDialog}
			>
				<DialogContent>
					<DialogContentText>
						Create a new channel
					</DialogContentText>
					<Grid container spacing={3}>
						<Grid item xs={12}>
							<ChoseMode />
						</Grid>
						<Grid item xs={12}>
							<AddChanPublic
								error={error}
								name={name}
								setName={setName}
							/>
							{whichMode === 'PROTECTED' ?
								<AddChanProtected
									error={error}
									password={password}
									setPassword={setPassword}
								/>
								: null }
							{whichMode === 'PRIVATE' ?
								<AddChanPrivate
									friendLabels={friendLabels}
									setInvitList={setInvitList}
								/>
								: null}
						</Grid>
						<Grid item xs={12}>
							<Button
								variant='contained'
								color='error'
								onClick={closeModal}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								variant='contained'
								onClick={handleSubmit}
							>
								Create Channel
							</Button>
						</Grid>
					</Grid>
				</DialogContent>
			</Dialog>
		</div>
	);
}
