import { Collapse, Grid, Paper, } from '@mui/material';
import { Box } from '@mui/system';
import { useState } from 'react';
import axios from 'axios';
import Activate2FA from '../../Component/Setting2FA/Activate2FA';
import Deactivate2FA from '../../Component/Setting2FA/Deactivate2FA';
import IconButtonActivate from './IconButtonActivate';

interface DisplayEtatProps {
    handleEdit2FA: () => void;
    handleActivate2FA: () => void;
    edit2FA: boolean;
    activate2FA: boolean;
}

export default function Display2FA({handleActivate2FA, handleEdit2FA, edit2FA, activate2FA}: DisplayEtatProps) {
    const [inputToken, setInputToken] = useState('');
    const [isValidToken, setIsValidToken] = useState(true);

    async function activate() {
        await axios.post('http://localhost:5000/otp/activate', {
            token: inputToken,
        })
        .then(function (response) {
            if (response.data === true)
                {
                    handleActivate2FA();
                    setIsValidToken(true);
                }
            else
                setIsValidToken(false);
            setInputToken('');
        })
        .catch(function (error) {
            console.log(error);
        });
    }

    async function deactivate() {
        await axios.post('http://localhost:5000/otp/deactivate', {
            token: inputToken,
        })
        .then(function (response) {
            if (response.data === true)
                {
                    handleActivate2FA();
                    setIsValidToken(true);
                }
            else
                setIsValidToken(false);
            setInputToken('');
        })
        .catch(function (error) {
            console.log(error);
        });
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
