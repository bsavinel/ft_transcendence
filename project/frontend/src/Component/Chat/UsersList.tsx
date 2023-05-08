import { Box, Avatar, Badge, IconButton, List, ListItem, ListItemText, styled, Tooltip } from '@mui/material';
import LocalPoliceOutlinedIcon from '@mui/icons-material/LocalPoliceOutlined';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import {useContext, useEffect, useState} from 'react';
import {getAccessContent} from '../../utils/ApiClient';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import SportsEsportsOutlinedIcon from '@mui/icons-material/SportsEsportsOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import './UsersList.css';
import { UserOnChannelDto} from './interfaces';
import {ChatSocketContext} from './ChatSocketContext';
import {Socket} from 'socket.io-client';

interface UsersListProps {
    usersList: UserOnChannelDto[];
}

const CustomIconButton = styled(IconButton)`
    padding: 3px;
`;

interface UserStatus {
    userId: number,
    isLogged: boolean,
}

export default function UsersList({usersList}: UsersListProps) {
    // Contient le userId: number du user hovered, null si rien hovered
    const [hover, setHover] = useState<number | null>(null);
	const myId: number = getAccessContent()?.userId as number;
    const [status, setStatus] = useState<UserStatus[]>([]);
    const socket: Socket | null = useContext(ChatSocketContext);

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

    const users = usersList.map((usr) => 
        <ListItem divider id='userListItem' 
            sx={{width: '100%', flexWrap: 'nowrap'}}
            disableGutters  key={usr.userId} onMouseOver={() => setHover(usr.userId)} onMouseLeave={() => setHover(null)} >
            <Badge
                className='statusBadge'
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                overlap='circular'
                variant='dot'
                color={setBadgeStatusColor(usr.userId) ? 'success' : 'error'}
            >
                <Avatar src={import.meta.env.VITE_BACK_URL + '/users/avatar/' + usr.userId } sx={{width: '35px', height: '35px'}} />
            </Badge>

            <ListItemText sx={{width: '100%', overflowX: 'hidden', marginLeft: '4px'}} primary={usr.username} />
            { hover === usr.userId && hover !== myId ? 
                <Box className='ulActions' display='flex' sx={{width: 'fit-content'}} flexWrap='nowrap'>
                    <Tooltip title='Add friend'>
                        <CustomIconButton>
                            <AddCircleOutlineOutlinedIcon sx={{fontSize: '1rem'}} />
                        </CustomIconButton>
                    </Tooltip>
                    <Tooltip title='Block user'>
                        <CustomIconButton>
                            <BlockOutlinedIcon sx={{fontSize: '1rem'}} />
                        </CustomIconButton>
                    </Tooltip>
                    <Tooltip title='Go to profile'>
                        <CustomIconButton>
                            <AccountCircleOutlinedIcon sx={{fontSize: '1rem'}} />
                        </CustomIconButton>
                    </Tooltip>
                    <Tooltip title='Game invite'>
                        <CustomIconButton  >
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
