import {ExpandLess, ExpandMore} from '@mui/icons-material';
import AlbumIcon from '@mui/icons-material/Album';
import Brightness1Icon from '@mui/icons-material/Brightness1';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import PanoramaFishEyeIcon from '@mui/icons-material/PanoramaFishEye';
import PersonIcon from '@mui/icons-material/Person';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import {Button, Collapse, ListItemButton, ListItemIcon, ListItemText, ListSubheader} from '@mui/material';
import {Dispatch, SetStateAction, useContext, useEffect, useState} from 'react';
import ApiClient, {getAccessContent} from '../../../utils/ApiClient';
import {ChatSocketContext} from '../ChatSocketContext';
import {ChannelDto, FriendListDto} from '../interfaces';


interface FriendListProps {
	addChan:  (name: string, mode:string, pass:string) => Promise<ChannelDto>;
	userFriends: FriendListDto[];
    handleSelectChannel: (chanList: ChannelDto | undefined) => void;
}

interface UserStatus {
    userId: number,
    isLogged: boolean,
}

export default function FriendList({addChan, userFriends, handleSelectChannel}: FriendListProps) {
	const [openCollapse, setOpenCollapse] = useState<boolean>(false);
	const [mapDirectChanStatus, setMapDirectChanStatus] = useState<Map<number, ChannelDto | boolean>>(new Map());
	const socket = useContext(ChatSocketContext);
    const [status, setStatus] = useState<UserStatus[]>([]);


	function joinDirectChan(friendId: number) {
		const chanStatus = mapDirectChanStatus.get(friendId);
		if (!chanStatus) {
			socket?.emit('isDirectChanExist', friendId, async function(reponse: ChannelDto | boolean) {
				const newDirectChanStatus = new Map<number, ChannelDto | boolean>(mapDirectChanStatus);
				if (reponse && typeof reponse !== 'boolean') {
					newDirectChanStatus.set(friendId, reponse);
					setMapDirectChanStatus(newDirectChanStatus);
					handleSelectChannel(reponse);
				} else {
					try {
						const newChan: ChannelDto = await addChan('JackyChan', 'DIRECT', '');
						socket?.emit('joinRoom', { user: friendId, chanId: newChan.id });
						handleSelectChannel(newChan);
					} catch (e) {
						console.error('An error occured while creating direct channel', e);
					}
				}
			});
		} else {
			if (typeof chanStatus !== 'boolean') {
				handleSelectChannel(chanStatus);
			}
		}
	}

	function getFriendStatu(userId: number): boolean {
        const data: UserStatus | undefined = status.find((userStatus) => userStatus.userId === userId);
        if (!data || data.isLogged === false)
            return false
        return true;
	}

	const friendListItem = userFriends.map((data: FriendListDto) => <ListItemButton key={data.id} onClick={() => joinDirectChan(data.id)}>
				<ListItemIcon>
			{getFriendStatu(data.id) === true ?
				<PersonIcon color='success'/>
				:
				<PersonOutlineIcon color='secondary'/>
			}
				</ListItemIcon>
			<ListItemText primary={data.username} />
		</ListItemButton>
	);

    useEffect(() => {
		if (userFriends.length === 0) return ;
        socket?.on('friendLoggedIn', (data: {user: number}) => {
            if (userFriends.find((usr) => usr.id === data.user)) {
                const majStatus = status.map((i) => {
                    if (i.userId === data.user)
                        return {...i, isLogged: true}
                    return i;
                });
                setStatus(majStatus);
            }
        });
        socket?.on('friendDisconnected', (data: {user: number}) => {
            if (userFriends.find((usr) => usr.id === data.user)) {
                const majStatus = status.map((i) => {
                    if (i.userId === data.user)
                        return {...i, isLogged: false}
                    return i;
                });
                setStatus(majStatus);
            }
        });
        return  () => {
            socket?.off('friendLoggedIn');
            socket?.off('friendDisconnected');
        }
    });

	function handleCollapse() {
		setOpenCollapse(!openCollapse);
	}

    useEffect(() => {
		if (userFriends.length === 0 || !socket) return ;
        const usersIds: number[] = userFriends.map((friend) => friend.id);
        socket?.emit('getStatus', usersIds, (data: {userId: number, isLogged: boolean}[]) => {
            setStatus(data);
        });
    }, [userFriends]);

	return (
		<>
			<ListItemButton onClick={handleCollapse} divider={true}>
				<ListItemText primary="Friends"/>
				{openCollapse ? <ExpandLess /> : <ExpandMore />}
			</ListItemButton>
			<Collapse in={openCollapse} timeout='auto' unmountOnExit>
				{friendListItem}
			</Collapse>
		</>
	);
}
