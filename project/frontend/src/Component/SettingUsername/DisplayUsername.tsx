import { Button, Collapse, Grid, Paper } from '@mui/material';
import{ useEffect, useState } from 'react';
import { Box } from '@mui/system';
import ApiClient, { getAccessContent } from '../../utils/ApiClient';
import { ca, tr } from 'date-fns/locale';
import { set } from 'lodash';

interface DisplayUsernameProps {
    children?: React.ReactNode[];
    editUser: boolean;

}


export default function DisplayUsername({children, editUser}: DisplayUsernameProps) {
	const [username, setUsername] = useState<string>('');
	
	async function getUsername() {
		try {
			let res = await ApiClient.get(`/users/profile/${getAccessContent()!.userId}`)
			setUsername(res.data.username);
			console.log(res.data);
		}
		catch (e) {
			
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
                        {children && children[1]}
                        <Button variant="contained" color='success'>
                            OK
                        </Button>
                    </Collapse>
                </Grid>
            </Grid>
        </Box>
    );
}
