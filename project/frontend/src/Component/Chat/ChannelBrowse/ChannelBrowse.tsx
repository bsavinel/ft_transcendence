import {ExpandLess, ExpandMore} from "@mui/icons-material";
import {Alert, Collapse, ListItemButton, ListItemIcon, ListItemText, Snackbar } from "@mui/material";
import {useEffect, useState} from "react";
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import ApiClient, {getAccessContent} from "../../../utils/ApiClient";
import LockIcon from '@mui/icons-material/Lock';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {socket} from "../ChatSocketContext";
import ModalChannelPub from "./ModalChannelPub";
import ModalChannelPro from "./ModalChannelPro";

interface ChannelBrowseDto {
	id: number,
	createdAt: string,
	updatedAt: string,
	channelName: string,
	mode: string,	
};

export default function ChannelBrowse() {
	const [openCollapse, setOpenCollapse] = useState<boolean>(false);
	const [openModalPro, setOpenModalPro] = useState<boolean>(false);
	const [openModalPub, setOpenModalPub] = useState<boolean>(false);
	const [openSnackSuccess, setOpenSnackSuccess] = useState<boolean>(false);
	const [openSnackFailure, setOpenSnackFailure] = useState<boolean>(false);
	const [inputPwd, setInputPwd] = useState<string>('');
	const [isValidPwd, setIsValidPwd] = useState<boolean>(true)
	const [currentChannel, setCurrentChannel] = useState<ChannelBrowseDto>();
	const [chan, setChan] = useState<ChannelBrowseDto[]>();
	const [skip, setSkip] = useState<number>(0);
	const [take, setTake] = useState<number>(5);
	const chanListItem = chan?.map((data: ChannelBrowseDto) => 
		<ListItemButton key={data.id} onClick={data.mode === "PROTECTED" ? 
			() => { setCurrentChannel(data); handleModalPro() } : 
			() => { setCurrentChannel(data); handleModalPub() }}>
			<ListItemIcon>
				<OpenInNewIcon />
			</ListItemIcon>
			<ListItemText primary={data.channelName} />
			{data.mode === 'PROTECTED' && 
			<ListItemIcon>
				<LockIcon color="error"/>
			</ListItemIcon>}
		</ListItemButton>
	);

	async function fetchNonPrivateChannel() {
		try {
			const getChan = await ApiClient.get("channels/nonPrivateChannel?skip=" + skip + "&take=" + take);
			if (chan){
				setChan(prevChan => prevChan?.concat(getChan.data));
			}
			else {
				setChan(getChan.data);
			}
			//FIXME
			//check si les valeur de skip/take sont bonne
			setSkip(skip + take);
			setTake(take + 5);
		} catch (e) {
			console.error('Error fetching NonPrivateChannel');
		}
	}

	useEffect(() => {
		fetchNonPrivateChannel();
	},[]);

	function handleCollapse() {
		setOpenCollapse(!openCollapse);
	}

	function handleModalPro() {
		setOpenModalPro(!openModalPro);
		setIsValidPwd(true);
		setInputPwd('');
	}

	function handleModalPub() {
		setOpenModalPub(!openModalPub);
	}

	function joinPublicChannel() {
		socket.emit('joinRoom', { user: getAccessContent()?.userId, chanId: currentChannel?.id });
		setOpenSnackSuccess(true);
		//FIXME
		//return validation socket + Snackbar conditional
	}

	function joinProtectedChannel() {
		socket.emit('joinProtectedRoom', { user: getAccessContent()?.userId, chanId: currentChannel?.id, pwd: inputPwd });
	}

	useEffect(() => {
		socket.on('badPassword', () => handlePwd(false));
		socket.on('validPassword', () => handlePwd(true));
		return (() => {
			socket.off('badPassword');
			socket.off('validPassword');
		});
	},[openModalPro]);

	function handlePwd(valid: boolean) {
		if (valid) {
			setOpenModalPro(!openModalPro);
			setInputPwd('');
			setOpenSnackSuccess(true);
		}
		else {
			setIsValidPwd(!isValidPwd);
			setOpenSnackFailure(true);
		}
	}

	return (
		<>
			<ListItemButton onClick={handleCollapse}>
				<ListItemText primary="Channels browse" />
				{openCollapse ? <ExpandLess /> : <ExpandMore />}
			</ListItemButton>
			<Collapse in={openCollapse} timeout='auto' unmountOnExit>
				{chanListItem}
				<ListItemButton onClick={fetchNonPrivateChannel}>
					<ListItemIcon>
						<MoreHorizIcon />
					</ListItemIcon>
					<ListItemText primary="Browse more"/>
				</ListItemButton>
			</Collapse>
			<ModalChannelPub 
				openModalPub={openModalPub}
				handleModalPub={handleModalPub}
				joinPublicChannel={joinPublicChannel}
			/>
			<ModalChannelPro
				openModalPro={openModalPro}
				handleModalPro={handleModalPro}
				joinProtectedChannel={joinProtectedChannel}
				inputPwd={inputPwd}
				setInputPwd={setInputPwd}
				isValidPwd={isValidPwd}
			/>
			<Snackbar open={openSnackSuccess} autoHideDuration={6000} onClose={() => { setOpenSnackSuccess(!openSnackSuccess) }}>
				<Alert severity="success">This is a success alert — <strong>check it out!</strong></Alert>
			</Snackbar>
			<Snackbar open={openSnackFailure} autoHideDuration={6000} onClose={() => { setOpenSnackFailure(!openSnackFailure) }}>
				<Alert severity="error">This is an error alert — <strong>check it out!</strong></Alert>
			</Snackbar>
		</>
	);
	
}

//TODO
//check la pagination prisma
//delete les icon en trop.. ou PAS!
//JoinPublicChannel
//	- 'rediriger' vers les message du chan ???
//JoinProtectedChannel
//	- faire le form pour rejoindre le chan + pwd
//	- check pwd with bscrypt
//		- faire un module pour le password
//TODO (again!)
//update channel list after join
//Filter les channel que l'utilisateur a deja join
