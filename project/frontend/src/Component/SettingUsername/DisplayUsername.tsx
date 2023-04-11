import { Button, Collapse, Grid, Paper } from '@mui/material';
import { Box } from '@mui/system';

interface DisplayUsernameProps {
    children?: React.ReactNode[];
    editUser: boolean;

}

export default function DisplayUsername({children, editUser}: DisplayUsernameProps) {
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
                        <h2>Username {children && children[0]}</h2>
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
