import { Box } from '@mui/system';
import Grid from '@mui/material/Grid';
import IconButtonEdit from '../../Component/SettingUsername/IconButtonEdit';
import DisplayUsername from '../../Component/SettingUsername/DisplayUsername';
import InputUsername from '../../Component/SettingUsername/InputUserName';
import { Button, Paper } from '@mui/material';
import DisplayAvatar from '../../Component/SettingAvatar/DisplayAvatar';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Display2FA from '../../Component/Setting2FA/Display2FA';
import {getAccessContent} from '../../utils/ApiClient';

// editUser: boolean | used for collapse in DisplayUsername
// edit2FA: boolean | used for collapse in Display2FA
// activate2FA: boolean | usef for swtich collapse content (Activate2FA/Deactivate2FA) in Display2FA
export default function Setting() {
	const [editUser, setEditUser] = useState<boolean>(false);
	const [edit2FA, setEdit2FA] = useState<boolean>(false);
	const [activate2FA, setActivate2FA] = useState<boolean>(false);

	async function fetchOtpIsActive(): Promise<boolean> {
		const userId = getAccessContent()?.userId;
		const response = await axios.get(`${import.meta.env.VITE_BACK_URL}/otp/isActive?userId=` + userId);
		return response.data;
	}

	useEffect(() => {
		fetchOtpIsActive()
		.then((isActive: boolean) => {
			setActivate2FA(isActive);
		})
	},[])

    function handleEditUser() {
        setEditUser(!editUser);
    }

    function handleEdit2FA() {
        setEdit2FA(!edit2FA);
    }

    function handleActivate2FA() {
        setActivate2FA(!activate2FA);
    }

    return (
        <Box sx={{ mt: '10vh'}}>
            <Grid
                container
                direction="row"
                justifyContent="space-around"
                alignItems="stretch"
                spacing={3}
                rowGap={5}
            >
                <Grid item xs={3}>
                        <DisplayAvatar />
                </Grid>
                <Grid item xs={8}>
                    <Paper elevation={10}>
                        <DisplayUsername editUser={editUser}>
                            <IconButtonEdit handleEditUser={handleEditUser}/>
                            <InputUsername />
                        </DisplayUsername>
                        <Display2FA 
                            handleEdit2FA={handleEdit2FA}
                            edit2FA={edit2FA} 
                            handleActivate2FA={handleActivate2FA} 
                            activate2FA={activate2FA}
                        />
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
