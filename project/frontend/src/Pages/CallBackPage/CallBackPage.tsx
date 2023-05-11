import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getAccessContent, setAccess } from '../../utils/ApiClient';
import { Button, TextField } from '@mui/material';
import { responsiveProperty } from '@mui/material/styles/cssUtils';

async function internAuthentification(): Promise<boolean> {
	let url = new URL(window.location.href);
	let params = {
		code: url.searchParams.get('code'),
	};
	if (!params.code) throw new Error('no code');

	const response = await axios.post<{
		refreshToken: string;
		accessToken: string;
		newUser: boolean;
	}>(`${import.meta.env.VITE_BACK_URL}/oauth/singin`, params, {
		withCredentials: true,
	});

	console.log('data : ', response.data);
	setAccess(response.data.accessToken);
	return response.data.newUser;
}

async function generateSecretOtp() {
	const params = {
		userId: getAccessContent()?.userId,
	};
	const generateSecret = await axios.post(
		`${import.meta.env.VITE_BACK_URL}/otp/generate`,
		params
	);
	console.log(generateSecret);
}

async function fetchOtpIsActive(): Promise<boolean> {
	const userId = getAccessContent()?.userId;
	const response = await axios.get(
		`${import.meta.env.VITE_BACK_URL}/otp/isActive?userId=` + userId
	);
	return response.data;
}

async function verifyOtp(token: string): Promise<boolean> {
	const params = {
		token: token,
		userId: getAccessContent()?.userId,
	};
	const response = await axios.post(
		`${import.meta.env.VITE_BACK_URL}/otp/verify`,
		params
	);
	return response.data;
}

//TODO
//check si otp activate
//si oui -> display check otp then navigate if true
//else -> navigate
export default function CallBackPage() {
	const [inputToken, setInputToken] = useState<string>('');
	const [isValidToken, setIsValidToken] = useState<boolean>(true);
	const [displayOtpInput, setDisplayOtpInput] = useState<boolean>(false);
	const navigate = useNavigate();

	useEffect(() => {
		internAuthentification()
			.then((newUser: boolean) => {
				if (newUser) {
					generateSecretOtp();
					navigate('/profile');
				} else {
					fetchOtpIsActive().then((askOTP: boolean) => {
						if (askOTP) {
							setDisplayOtpInput(true);
						} else {
							navigate('/');
						}
					});
				}
			})
			.catch((e) => {
				console.error(e);
				navigate('/');
			});
	}, [navigate]);

	function check() {
		verifyOtp(inputToken).then((response: boolean) => {
			if (response) {
				navigate('/home');
			} else {
				setIsValidToken(false);
			}
		});
		setInputToken('');
	}

	//TODO
	//mettre sur un Paper dans une div
	return (
		<>
			{displayOtpInput && (
				<>
					<TextField
						error={!isValidToken}
						helperText={!isValidToken ? 'Invalid token' : ''}
						label="Token"
						onChange={(e) => setInputToken(e.target.value)}
						value={inputToken}
					/>
					<Button onClick={check} variant="contained">
						Verify
					</Button>
				</>
			)}
		</>
	);
}
