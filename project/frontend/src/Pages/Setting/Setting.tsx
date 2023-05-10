import { Box } from '@mui/system';
import Grid from '@mui/material/Grid';
import IconButtonEdit from '../../Component/SettingUsername/IconButtonEdit';
import DisplayUsername from '../../Component/SettingUsername/DisplayUsername';
import InputUsername from '../../Component/SettingUsername/InputUserName';
import { Button, Paper } from '@mui/material';
import DisplayAvatar from '../../Component/SettingAvatar/DisplayAvatar';
import { useState } from 'react';
import axios from 'axios';
import Display2FA from '../../Component/Setting2FA/Display2FA';

// editUser: boolean | used for collapse in DisplayUsername
// edit2FA: boolean | used for collapse in Display2FA
// activate2FA: boolean | usef for swtich collapse content (Activate2FA/Deactivate2FA) in Display2FA
export default function Setting() {
    const [editUser, setEditUser] = useState(false);
    const [edit2FA, setEdit2FA] = useState(false);
    const [activate2FA, setActivate2FA] = useState(false);

    function handleEditUser() {
        setEditUser(!editUser);
    }

    function handleEdit2FA() {
        setEdit2FA(!edit2FA);
    }
    
	//FIXME
	//fetch pour check si il est deja activate
	//sinon a la reco il propose activate instead of deactivate
    function handleActivate2FA() {
        setActivate2FA(!activate2FA);
    }

    return (
        <Box>
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
