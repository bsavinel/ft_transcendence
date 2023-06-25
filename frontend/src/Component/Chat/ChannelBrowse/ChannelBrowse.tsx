import {ExpandLess, ExpandMore} from "@mui/icons-material";
import {Alert, Button, Collapse, ListItemButton, ListItemIcon, ListItemText, Snackbar } from "@mui/material";
import {useEffect, useState, useContext} from "react";
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import ApiClient, {getAccessContent} from "../../../utils/ApiClient";
import LockIcon from '@mui/icons-material/Lock';
import ModalChannelPub from "./ModalChannelPub";
import ModalChannelPro from "./ModalChannelPro";
import { ChatSocketContext } from '../ChatSocketContext';
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import { AxiosError } from 'axios';
import {ChannelDto} from "../interfaces";

interface ChannelBrowseProps {
	addToChanList: (chan: ChannelDto) => void;
	browseChanList: ChannelDto[] | undefined;
	setBrowseChanList: (chanList: ChannelDto[] | undefined) => void;
	majBrowseList: boolean;
}

export default function ChannelBrowse({ addToChanList, browseChanList, setBrowseChanList, majBrowseList }: ChannelBrowseProps) {
	const [error, setError] = useState<string | undefined>(undefined);
	const [openCollapse, setOpenCollapse] = useState<boolean>(false);
	const [openModal, setOpenModal] = useState<boolean>(false);
	const [openSnackSuccess, setOpenSnackSuccess] = useState<boolean>(false);
	const [inputPwd, setInputPwd] = useState<string>('');
	const [isValidPwd, setIsValidPwd] = useState<boolean>(true)
	const [currentChannel, setCurrentChannel] = useState<ChannelDto>();
	const socket = useContext(ChatSocketContext);
	const myId: number = getAccessContent()?.userId as number;
	const chanListItem = browseChanList?.map((data: ChannelDto) => 
		<ListItemButton key={data.id} onClick={data.mode === "PROTECTED" ? 
			() => { setCurrentChannel(data); handleModalPro() } : 
			() => { setCurrentChannel(data); handleModalPub() }}>
			<ListItemIcon>
				<ControlPointIcon />
			</ListItemIcon>
			<ListItemText primary={data.channelName} />
			{data.mode === 'PROTECTED' && 
			<ListItemIcon>
				<LockIcon color="error"/>
			</ListItemIcon>}
		</ListItemButton>
	);

	async function browseMore() {
		const skip = browseChanList ? browseChanList.length : 0;
		const take = skip + 5;
		try {
			const getChan: ChannelDto[] = (await ApiClient.get("channels/nonPrivateChannel?skip=" + skip + "&take=" + take)).data;
			if (getChan.length == 0) return;
			if (browseChanList)
				setBrowseChanList([...browseChanList, ...getChan]);
			else
				setBrowseChanList(getChan);
		} catch (e) {
			console.error('Error fetching NonPrivateChannel', e);
		}
	}

	async function fetchNonPrivateChannel(take: number) {
		try {
			const getChan: ChannelDto[] = (await ApiClient.get("channels/nonPrivateChannel?skip=" + 0 + "&take=" + take)).data;
			if (getChan.length === 0) {
				if (!browseChanList) return ;
				setBrowseChanList(undefined);
			}
			else
				setBrowseChanList(getChan);
		} catch (e) {
			console.error('Error fetching NonPrivateChannel', e);
		}
	}
	
	// Refresh le composant et la browseList des que la variable majBrowseList est updated
	useEffect(() => {
		const take: number = browseChanList ? browseChanList.length : 5;
		fetchNonPrivateChannel(take);
		setCurrentChannel(undefined);
	}, [majBrowseList]);

	useEffect(() => {
		fetchNonPrivateChannel(5);
	},[]);

	function handleCollapse() {
		setOpenCollapse(!openCollapse);
	}

	function handleModalPro() {
		setOpenModal(!openModal);
		setIsValidPwd(true);
		setInputPwd('');
	}

	function handleModalPub() {
		setOpenModal(!openModal);
	}

	async function joinChan() {
		if (!currentChannel)
			return ;
		try {
			const chan: ChannelDto = (await ApiClient.post('channels/join/' + currentChannel.id, {password: inputPwd})).data;
			socket?.emit('someoneJoinedRoom', currentChannel.id);
			setOpenSnackSuccess(true);
			setOpenModal(false);
			addToChanList(chan);
		} catch(error) {
			console.error(error);
            if (error instanceof AxiosError && error.response) {
                setError(error.response.data.message);
                return ;
            }
            setError('An error occured while editing chan.');
		}
	}

	return (
		<>
			<ListItemButton onClick={handleCollapse} divider={true}>
				<ListItemText primary="Channels browse" />
				{openCollapse ? <ExpandLess /> : <ExpandMore />}
			</ListItemButton>
			<Collapse in={openCollapse} timeout='auto' unmountOnExit>
				{chanListItem}
				<ListItemButton onClick={browseMore}>
					<ListItemIcon>
						<MoreHorizIcon />
					</ListItemIcon>
					<ListItemText primary="Browse more"/>
				</ListItemButton>
			</Collapse>
			{currentChannel ? 
				currentChannel.mode === 'PUBLIC' ? 
				<ModalChannelPub 
					openModalPub={openModal}
					handleModalPub={handleModalPub}
					joinPublicChannel={joinChan}
				/>
				:
					<ModalChannelPro
						openModalPro={openModal}
						handleModalPro={handleModalPro}
						joinProtectedChannel={joinChan}
						inputPwd={inputPwd}
						setInputPwd={setInputPwd}
						isValidPwd={error ? false : true}
					/>
			: null}
			<Snackbar open={openSnackSuccess} autoHideDuration={6000} onClose={() => { setOpenSnackSuccess(!openSnackSuccess) }}>
				<Alert severity="success"><strong>Room joined successfully!</strong></Alert>
			</Snackbar>
            <Snackbar open={error ? true : false} autoHideDuration={6000} onClose={() => setError(undefined)}>
				<Alert severity="error">{error}</Alert>
			</Snackbar>
		</>
	);
}
