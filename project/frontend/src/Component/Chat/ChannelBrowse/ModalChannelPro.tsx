import { Box, Button, Grid, Modal, TextField } from "@mui/material";
import {Dispatch, SetStateAction} from "react";

interface modalChannelProtect {
	openModalPro: boolean;
	handleModalPro: () => void;
	joinProtectedChannel: () => void;
	inputPwd: string;
	setInputPwd: Dispatch<SetStateAction<string>>;
	isValidPwd: boolean;
};

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export default function ModalChannelPro({ 
	openModalPro, 
	handleModalPro, 
	joinProtectedChannel, 
	inputPwd, 
	setInputPwd,
	isValidPwd }: modalChannelProtect) {
	return (
		<Modal
			open={openModalPro}
			onClose={handleModalPro}
		>
			<Box sx={style}>
				<Grid container justifyContent="center">
					<Grid item xs={12}>
						<TextField
							error={!isValidPwd}
							helperText={!isValidPwd ? "Retente ta chance!" : ""}
							label="Password"
							type="password"
							value={inputPwd}
							onChange={(e) => setInputPwd(e.target.value)}
						/>
					</Grid>
					<Grid item xs={12}>
						<Button 
							variant="contained" 
							color="error"
							onClick={handleModalPro}
						>
							Cancel
						</Button>
						<Button 
							variant="contained" 
							color="success"
							onClick={joinProtectedChannel}
						>
							Join channel
						</Button>
					</Grid>
				</Grid>
			</Box>
		</Modal>
	);
}
