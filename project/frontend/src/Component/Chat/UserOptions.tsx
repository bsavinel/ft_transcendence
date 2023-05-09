import { Menu, MenuItem } from '@mui/material';

interface UserOptionsProps {
    anchorEl: HTMLElement | undefined;
    handleClickOptions: (opt: string) => void;
    handleClose: () => void;
}

export default function UserOptions({anchorEl, handleClickOptions, handleClose}: UserOptionsProps) {
    const open = Boolean(anchorEl);

    return (
        <div>
            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'basic-button',
                }}
            >
                <MenuItem key='mute' onClick={() => handleClickOptions('mute')} >mute</MenuItem>
                <MenuItem key='kick' onClick={() => handleClickOptions('kick')} >kick</MenuItem>
                <MenuItem key='ban' onClick={() => handleClickOptions('ban')} >ban</MenuItem>
                <MenuItem key='admin' onClick={() => handleClickOptions('admin')} >admin</MenuItem>
            </Menu>
        </div>
    );
}
