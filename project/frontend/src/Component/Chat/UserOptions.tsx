import { Menu, MenuItem } from '@mui/material';

interface UserOptionsProps {
    anchorEl: HTMLElement;
    handleClickOptions: (opt: string) => void;
    handleClose: () => void;
    actions: string[];
}

export default function UserOptions({anchorEl, actions, handleClickOptions, handleClose}: UserOptionsProps) {
    const open = Boolean(anchorEl && actions.length > 0);

    const items = actions.map((action) => 
        <MenuItem key={action} onClick={() => handleClickOptions(action)}>{action}</MenuItem>
    );

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
                {items}
            </Menu>
        </div>
    );
}
