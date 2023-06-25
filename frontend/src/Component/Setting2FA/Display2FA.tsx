import { Collapse, Grid, Paper, } from '@mui/material';
import { Box } from '@mui/system';
import { useState } from 'react';
import Activate2FA from '../../Component/Setting2FA/Activate2FA';
import Deactivate2FA from '../../Component/Setting2FA/Deactivate2FA';
import IconButtonActivate from './IconButtonActivate';
import ApiClient from '../../utils/ApiClient';

interface DisplayEtatProps {
    handleEdit2FA: () => void;
    handleActivate2FA: () => void;
    edit2FA: boolean;
    activate2FA: boolean;
}

export default function Display2FA({handleActivate2FA, handleEdit2FA, edit2FA, activate2FA}: DisplayEtatProps) {
    const [inputToken, setInputToken] = useState<string>('');
    const [isValidToken, setIsValidToken] = useState<boolean>(true);

    async function activate() {
        const response = await ApiClient.post('otp/activate', { token: inputToken });
        if (response.data) {
            handleActivate2FA();
            setIsValidToken(true);
        } else {
            setIsValidToken(false);
        }
        setInputToken('');
    }

    async function deactivate() {
        const response = await ApiClient.post('otp/deactivate', { token: inputToken });
        if (response.data) {
            handleActivate2FA();
            setIsValidToken(true);
        } else {
            setIsValidToken(false);
        }
        setInputToken('');
    }

    return (
        <Box>
            <Grid container justifyContent="center">
                <Grid item xs={12}>
                    <Paper elevation={10} sx={{ textAlign: 'center'}}>
                        <h2>Two Factor Authentication
                            <IconButtonActivate handleEdit2FA={handleEdit2FA} activate2FA={activate2FA} />
                        </h2>
                    </Paper>
                </Grid>
                <Grid item xs={12}>
                    <Collapse in={edit2FA} timeout='auto' unmountOnExit>
                        {activate2FA ? (<Deactivate2FA deactivate={deactivate} setInputToken={setInputToken} inputToken={inputToken} isValidToken={isValidToken}/>)
                        : (<Activate2FA inputToken={inputToken} setInputToken={setInputToken} activate={activate} isValidToken={isValidToken}/>)}
                    </Collapse>
                </Grid>
            </Grid>
        </Box>
    );
}

