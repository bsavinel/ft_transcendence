import { Button, Collapse, Grid, Snackbar, Alert, Paper } from '@mui/material';
import{ useEffect, useState } from 'react';
import { Box } from '@mui/system';
import ApiClient, { getAccessContent } from '../../utils/ApiClient';
import { ca, tr } from 'date-fns/locale';
import { set } from 'lodash';
import { TextField } from '@mui/material';
import { isAxiosError } from 'axios';

interface DisplayUsernameProps {
    children?: React.ReactNode[];
    editUser: boolean;

}


export default function DisplayUsername({children, editUser}: DisplayUsernameProps) {
	const [username, setUsername] = useState<string>("");
	const [edit, setEdit] = useState<string>("");
	const [error, setError] = useState<string | null>(null);

	async function getUsername() {
		try {
			let res = await ApiClient.get(`/users/profile/${getAccessContent()!.userId}`)
			setUsername(res.data.username);
		}
		catch (e) {
			
		}
	}

	async function sendUsername() {
		try {
			let res = await ApiClient.patch(`/users/updateUserName`, {username: edit});
			setUsername(res.data.username);
		}
		catch (e) {
			if (isAxiosError(e))
				setError(e.response?.data?.message ?? e.message);
			else
				setError("Userneame dont't change for unknow reason");
		}
	}

	useEffect( () => {
		getUsername();
	}, []);


    return (
        <Box>
            <Grid 
                container 
                direction='row' 
                justifyContent='center'
                wrap='wrap'
            >
                <Grid item xs={12}>
                    <Paper elevation={10} sx={{ textAlign: 'center'}}>
                        <h2>{username} {children && children[0]}</h2>
                    </Paper>
                </Grid>
                <Grid item >
                    <Collapse in={editUser} timeout='auto' unmountOnExit>
                        {/* {children && children[1]} */}
						<TextField value={edit} onChange={(e) => (setEdit(e.target.value))} size='small' id='username' label='Modify your username' variant='outlined' />
                        <Button variant="contained" color='success' onClick={() => sendUsername()}>
                            OK
                        </Button>
						<Snackbar open={error !== null ? true : false} autoHideDuration={6000} onClose={() => setError(null)}>
              				<Alert severity="error">{error}</Alert>
          				</Snackbar>
                    </Collapse>
                </Grid>
            </Grid>
        </Box>
    );
}
