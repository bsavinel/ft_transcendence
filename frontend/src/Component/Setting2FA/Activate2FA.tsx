import { Grid, TextField, Button } from '@mui/material';
import { authenticator } from '@otplib/preset-default';
import qrcode from 'qrcode';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import ApiClient from '../../utils/ApiClient';

interface Activate2FAProps {
    setInputToken: Dispatch<SetStateAction<string>>;
    inputToken: string;
    activate: () => void;
    isValidToken: boolean;
}
// If 2FA isn't set:
//     - display secret / qrcode
//     - display token verif input
export default function Activate2FA({setInputToken, inputToken, activate, isValidToken}: Activate2FAProps) {
	const [secret, setSecret] = useState<string>('');

	async function getSecret() {
		const getSecret = await ApiClient.get('otp/secret');
		setSecret(getSecret.data.secretOtp);
	}

	useEffect(() => {
		getSecret();
	},[])

    const user = 'A user name, possibly an email';
    const service = 'A service name';
    let qrcodePath = '';
    const otpauth = authenticator.keyuri(user, service, secret);

    qrcode.toDataURL(otpauth, (err, imageUrl) => {
        if (err) {
            console.log('Error with QR');
            return;
        }
        qrcodePath = imageUrl;
    });

    return (
        <Grid container justifyContent='space-evenly'>
            <Grid item>
                <TextField disabled label='Secret' value={secret}/>
            </Grid>
            <Grid item>
                <img src={qrcodePath}/>
            </Grid>
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
                <Button onClick={activate} variant='contained'>Activate 2FA</Button>
            </Grid>
        </Grid>
    );
}

