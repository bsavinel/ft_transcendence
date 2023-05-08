import {TextField} from "@mui/material";
import {Dispatch, SetStateAction} from "react";

interface AddChanPublicProps {
	error: string | undefined;
	name: string;
	setName: Dispatch<SetStateAction<string>>;
}

export default function AddChanPublic ({error, name, setName}: AddChanPublicProps) {
	return (
		<TextField 
			id='create-chan-name'
			variant='outlined'
			label={error? error : "Enter chan name"}
			required autoSave='off'
			onChange={(e) => setName(e.target.value)} 
			value={name}
			error={!!error}
		/>
	);
}
