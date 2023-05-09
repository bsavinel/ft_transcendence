import { Button, Card, CardActions, CardMedia, Paper, TextField } from '@mui/material';
import axios from 'axios';
import { ChangeEvent, useState } from 'react';
import ApiClient, { getAccessContent } from '../../utils/ApiClient';

export default function DisplayAvatar() {
    const [avatar, setAvatar] = useState<File>();
	const myId: number = getAccessContent()?.userId as number;

    function handleChange(event: ChangeEvent<HTMLInputElement>) {
        if (event.target.files)
            setAvatar(event.target.files[0]);
    }

    async function handleUploadClick() {
        if (!avatar) {
            return;
        }
        const formData = new FormData();
        formData.append("avatar", avatar);

        await ApiClient.post(`${import.meta.env.VITE_BACK_URL}/users/upload`, formData, {
            headers: {
                'content-type': 'multipart/form-data'
            },
        });
    }


    return (
        <Paper elevation={10}>
            <Card>
                <CardMedia 
                    sx={{ height: 400 }}
                    image={import.meta.env.VITE_BACK_URL + '/users/avatar/' + myId }
                    title='Avatar'
                />
                <CardActions>
                    <TextField name='Choose file...' type='file' onChange={handleChange}/>
                    <Button variant='contained' onClick={handleUploadClick}>Upload</Button>
                </CardActions>
            </Card>
        </Paper>
    );
}
