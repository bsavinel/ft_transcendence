import {Visibility, VisibilityOff} from "@mui/icons-material";
import {IconButton, InputAdornment, TextField} from "@mui/material";
import {Dispatch, SetStateAction, useState} from "react";

interface AddChanProtectedProps {
	error: string | undefined;
	password: string;
	setPassword: Dispatch<SetStateAction<string>>

}

export default function AddChanProtected ({error, password, setPassword} : AddChanProtectedProps) {
	const [showPassword, setShowPassword] = useState<boolean>(false);
	const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
	};

	return (
		<form autoComplete='off'>
		<TextField 
			autoComplete='off'
			id='edit-chan-password' 
			variant='outlined'  
			label={error? 'Try again' : "Enter password"}
			error={!!error} 
			required value={password} 
			onChange={(e: any) => setPassword(e.target.value)}
			type={showPassword ? 'text' : 'password'} 
			InputProps={{endAdornment: 
				<InputAdornment position="end">
					<IconButton
						onClick={() => setShowPassword(!showPassword)}
						onMouseDown={handleMouseDownPassword}
						edge="end"
					>
						{showPassword ? <VisibilityOff /> : <Visibility />}
					</IconButton>
				</InputAdornment>
			}}
		/>
		</form>
	);
}
