import { IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

interface IconButtonEditProps {
    handleEditUser: () => void;
}

export default function IconButtonEdit({handleEditUser}: IconButtonEditProps) {
    return (
        <Tooltip title='edit' placement='right'>
            <IconButton onClick={handleEditUser}>
                <EditIcon />
            </IconButton>
        </Tooltip>
    );
}
