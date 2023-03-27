import { Menu, MenuItem } from '@mui/material';

export default function UserOptions(props: any) {
    const open = Boolean(props.anchorEl);

    function handleClose() {
        props.setAnchorEl(null);
    }

    const ownerChoices = (
        <div>
            <MenuItem onClick={handleClose}>Block</MenuItem>
            <MenuItem onClick={handleClose}>Kick</MenuItem>
            <MenuItem onClick={handleClose}>Mute</MenuItem>
            <MenuItem onClick={handleClose}>Ban</MenuItem>
        </div>
    )

    const lambdaChoices = (
        <div>
            <MenuItem onClick={handleClose}>Block</MenuItem>
        </div>
    )


    return (
        <div>
            <Menu
                id="basic-menu"
                anchorEl={props.anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'basic-button',
                }}
            >
                {props.isOwner===true ? ownerChoices : lambdaChoices}
            </Menu>
        </div>
    );
}
