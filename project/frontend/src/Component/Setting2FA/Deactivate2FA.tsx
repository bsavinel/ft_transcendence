import { Button, Grid, TextField } from '@mui/material';
import { Dispatch, SetStateAction } from 'react';

interface Deactivate2FAProps {
    setInputToken: Dispatch<SetStateAction<string>>;
    inputToken: string;
    deactivate: () => void;
    isValidToken: boolean;
}

// if 2FA is set:
//         - display unset button
//         - display token verif input
export default function Deactivate2FA({setInputToken, inputToken, deactivate, isValidToken}: Deactivate2FAProps) {
    return (
        <Grid container direction='column' spacing={1} xs={4}>
            <Grid item>
                <TextField 
                    error={!isValidToken}
                    helperText={!isValidToken ? "Invalid token" : ""}
                    label='Token'
                    onChange={(e) => setInputToken(e.target.value)}
                    value={inputToken}
                />
            </Grid>
            <Grid item>
                <Button onClick={deactivate} variant='contained'>Deactivate 2FA</Button>
            </Grid>
        </Grid>
    );
}
