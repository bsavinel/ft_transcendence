import { Box, Avatar, Badge, IconButton, List, ListItem, ListItemText, styled, Tooltip } from '@mui/material';
import LocalPoliceOutlinedIcon from '@mui/icons-material/LocalPoliceOutlined';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import {useContext, useEffect, useRef, useState} from 'react';
import {getAccessContent} from '../../utils/ApiClient';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import SportsEsportsOutlinedIcon from '@mui/icons-material/SportsEsportsOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import './UsersList.css';
import { ChannelDto, UserOnChannelDto} from './interfaces';
import {ChatSocketContext} from './ChatSocketContext';
import {Socket} from 'socket.io-client';
import UserOptions from './UserOptions';
import { PongSocketContext } from '../Pong/PongSocketContext';
import { useNavigate } from 'react-router-dom';

interface UsersListProps {
    usersList: UserOnChannelDto[];
    reloadMessagesList: () => void;
    selectedChannel: ChannelDto;
}

const CustomIconButton = styled(IconButton)`
    padding: 3px;
`;

interface UserStatus {
    userId: number,
    isLogged: boolean,
}

export default function UsersList({usersList, reloadMessagesList, selectedChannel}: UsersListProps) {
    // Contient le userId: number du user hovered, null si rien hovered
    const [hover, setHover] = useState<number | null>(null);
	const myId: number = getAccessContent()?.userId as number;
    const [status, setStatus] = useState<UserStatus[]>([]);
    const socket: Socket | null = useContext(ChatSocketContext);
    const socketPong: Socket | null = useContext(PongSocketContext);
    const me: UserOnChannelDto | undefined = usersList.find((uoc) => uoc.userId === myId);
    const navigate = useNavigate();

    function roleBadge(role: string) {
        if (role === 'ADMIN') return (
            <Tooltip title='Admin' >
                <LocalPoliceOutlinedIcon sx={{fontSize: '1rem'}}/>
            </Tooltip>
        );
        if (role === 'CREATOR') return (
            <Tooltip title='Owner' >
                <StarBorderIcon sx={{fontSize: '1rem'}} />
            </Tooltip>
        );
        return null;
    }

    useEffect(() => {
        socket?.on('someoneLoggedIn', (data: {user: number}) => {
            if (usersList.find((usr) => usr.userId === data.user)) {
                const majStatus = status.map((i) => {
                    if (i.userId === data.user)
                        return {...i, isLogged: true}
                    return i;
                });
                setStatus(majStatus);
            }
        });
        socket?.on('someoneDisconnected', (data: {user: number}) => {
            if (usersList.find((usr) => usr.userId === data.user)) {
                const majStatus = status.map((i) => {
                    if (i.userId === data.user)
                        return {...i, isLogged: false}
                    return i;
                });
                setStatus(majStatus);
            }
        });
        return  () => {
            socket?.off('someoneLoggedIn');
            socket?.off('someoneDisconnected');
        }
    });

    useEffect(() => {
        const usersIds: number[] = usersList.map((usr) => usr.userId);
        socket?.emit('getStatus', usersIds, (data: {userId: number, isLogged: boolean}[]) => {
            setStatus(data);
        });
    }, [usersList]);

    // Cherche dans la liste de status le userId provided, et retourne true ou false en fct de sont status.
    function setBadgeStatusColor(userId: number): boolean {
        const data: UserStatus | undefined = status.find((userStatus) => userStatus.userId === userId);
        if (!data || data.isLogged === false)
            return false
        return true;
    }

    const [anchorEl, setAnchorEl] = useState<HTMLElement | undefined>();
    const targetRef = useRef<UserOnChannelDto | undefined>();

    function displayOpts(e: React.MouseEvent<HTMLElement | undefined>, target: UserOnChannelDto) {
        setAnchorEl(anchorEl ? undefined : e.currentTarget);
        targetRef.current = target;
    }

     function handleCloseMenu() {
         setAnchorEl(undefined);
        targetRef.current = undefined;
     }

    function getUserOnChan(userId: number): UserOnChannelDto | undefined {
       return usersList.find((usr) => usr.userId === userId);
    }

    function sendFriendInvite(toUserId: number) {
        const invitation = [{
            type: "FRIEND",
            friendId: me?.userId,
            invitedUsers: toUserId,
        }];
        socket?.emit('newInvit', {invit: invitation, user: me?.username});
    }

    function sendGameInvit(toUserId: number) {
        const invitation = [{
            type: "GAME",
            friendId: me?.userId,
            invitedUsers: toUserId,
        }];
        socketPong?.emit('newInvit', {invit: invitation, user: me?.username});
    }

    function emitBlockUser(targetId: number) {
        socket?.emit('block', targetId, () => {
            reloadMessagesList();
        });
    }

    //TODO: Quand on block un user, il faut reload la friend list et checker que le direct message est supprime?
    // Option must be of: 'ban' / 'kick' / 'mute' / 'block' / 'friend'
    function handleClickOptions(option: string) {
        if (!targetRef.current) return ;
            if (option === 'admin') {
                socket?.emit('changeRights', {targetId: targetRef.current.userId, chanId: selectedChannel.id});
            }
            socket?.emit(option, {targetId: targetRef.current.userId, chanId: selectedChannel.id});
        handleCloseMenu();
    }

    const users = usersList.map((usr) => 
        <ListItem divider id='userListItem' 
            sx={{width: '100%', flexWrap: 'nowrap'}}
            disableGutters  key={usr.userId} onMouseOver={() => setHover(usr.userId)} onMouseLeave={() => setHover(null)} >
            { me?.role === 'USER' || usr.role === 'CREATOR' ?
                null :
                <UserOptions anchorEl={anchorEl}
                    handleClickOptions={handleClickOptions}
                    handleClose={handleCloseMenu} />
                }
            <Badge
                className='statusBadge'
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                overlap='circular'
                variant='dot'
                color={setBadgeStatusColor(usr.userId) ? 'success' : 'error'}
            >
                <Avatar src={import.meta.env.VITE_BACK_URL + '/users/avatar/' + usr.userId } sx={{width: '35px', height: '35px'}} 
                        data-useronchan={JSON.stringify(getUserOnChan(usr.userId))}
                    onClick={usr.userId === myId ? undefined : (e) => displayOpts(e, usr)}
                />
            </Badge>

            <ListItemText sx={{width: '100%', overflowX: 'hidden', marginLeft: '4px'}} primary={usr.username} />
            { hover === usr.userId && hover !== myId ? 
                <Box className='ulActions' display='flex' sx={{width: 'fit-content'}} flexWrap='nowrap'>
                    {/* TODO: if user is friend disable */}
                    <Tooltip title='Add friend'>
                        <CustomIconButton onClick={() => sendFriendInvite(usr.userId)} >
                            <AddCircleOutlineOutlinedIcon sx={{fontSize: '1rem'}} />
                        </CustomIconButton>
                    </Tooltip>
                    <Tooltip title='Block user'>
                        <CustomIconButton onClick={() => emitBlockUser(usr.userId)} >
                            <BlockOutlinedIcon sx={{fontSize: '1rem'}} />
                        </CustomIconButton>
                    </Tooltip>
                    <Tooltip title='Go to profile'>
                        <CustomIconButton>
                            <AccountCircleOutlinedIcon sx={{fontSize: '1rem'}} />
                        </CustomIconButton>
                    </Tooltip>
                    <Tooltip title='Game invite'>
                        <CustomIconButton onClick={() => sendGameInvit(usr.userId)} >
                            <SportsEsportsOutlinedIcon sx={{fontSize: '1rem'}} />
                        </CustomIconButton>
                    </Tooltip>
                </Box>
            :  roleBadge(usr.role)
            }
        </ListItem>
    );

    return (
        <List sx={{ height: '100%', width: '100%' }} >
            {users}
        </List>
    );
}
