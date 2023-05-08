import {Autocomplete, TextField} from "@mui/material";
import {Dispatch, SetStateAction, useState} from "react";

interface AddChanPrivateProps {
	friendLabels: { label: string; id: number }[] | undefined;
	setInvitList: Dispatch<SetStateAction<{ label: string; id: number }[] | undefined>>;
}

export default function AddChanPrivate({friendLabels, setInvitList}: AddChanPrivateProps) {
	const [inputValue, setInputValue] = useState<string>('');

	//TODO optionnel
	//Checkbox
	//Grouped
	return (
		<Autocomplete
			disablePortal
			multiple
			onChange={(event, newValue) => {
				setInvitList(newValue);
			}}
			inputValue={inputValue}
			onInputChange={(event, newInputValue) => {
				setInputValue(newInputValue);
			}}
			id="Choose-friend"
			options={friendLabels ? friendLabels : []}
			sx={{ width: 300 }}
			renderInput={(params) => <TextField {...params} label="Friends" />}
			isOptionEqualToValue={(option, value) => option.label === value.label}
		/>
	);
}
