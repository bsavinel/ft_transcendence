import {
	Button,
	Card,
	CardActions,
	CardMedia,
	Paper,
	TextField,
} from '@mui/material';
import axios, { AxiosError } from 'axios';
import { ChangeEvent, useState } from 'react';
import ApiClient, { getAccessContent } from '../../utils/ApiClient';
import { set } from 'lodash';
import { useNavigate } from 'react-router-dom';

export default function DisplayAvatar() {
	const [avatar, setAvatar] = useState<File>();
	const [error, setError] = useState<string | undefined>(undefined);
	const myId: number = getAccessContent()?.userId as number;
	const nav = useNavigate();

	function handleChange(event: ChangeEvent<HTMLInputElement>) {
		if (event.target.files && event.target.files.length > 0) {
			setAvatar(event.target.files[0]);
			error && setError(undefined);
		}
	}

	async function handleUploadClick() {
		if (!avatar) return;
		const formData = new FormData();
		formData.append('avatar', avatar);
		try {
			await ApiClient.post(
				`${import.meta.env.VITE_BACK_URL}/users/upload`,
				formData,
				{
					headers: {
						'content-type': 'multipart/form-data',
					},
				}
			);
			nav('/setting');
		} catch (e) {
			console.error(e);
			if (e instanceof AxiosError && e.response?.status === 422)
				setError('Wrong file type');
			else 
				setError('Error');
		}
	}


	return (
		<Paper elevation={10}>
			<Card>
				<CardMedia
					sx={{ height: 400 }}
					image={
						`${import.meta.env.VITE_BACK_URL}/users/avatar/${myId}/?${Date.now()}`
					}
					title="Avatar"
				/>
				<CardActions>
					<TextField
						error={ error ? true : false}
						name="Choose file..."
						type="file"
						inputProps={{
							accept: '.jpeg,.jpg,.png'
						}}
						onChange={handleChange}
					/>
					<Button variant="contained" onClick={handleUploadClick}>
						Upload
					</Button>
				</CardActions>
			</Card>
		</Paper>
	);
}
