import { IconButton, Tooltip } from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';

interface IconButtonActivateProps {
    handleEdit2FA: () => void;
    activate2FA: boolean;
}

export default function IconButtonActivate({handleEdit2FA, activate2FA}: IconButtonActivateProps) {
    return (
        <Tooltip title={'active'} placement='right'>
            <IconButton onClick={handleEdit2FA}>
                <SecurityIcon
                    color={activate2FA ? ('success') : ('warning')}
                fontSize='large'/>
            </IconButton>
        </Tooltip>
    );
}
