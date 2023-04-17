import { Box, Button, Grid, Modal } from "@mui/material";
import randomSentence from "./utils";

interface modalChannelPublic {
	openModalPub: boolean;
	handleModalPub: () => void;
	joinPublicChannel: () => void;
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

export default function ModalChannelPub({ openModalPub, handleModalPub, joinPublicChannel}: modalChannelPublic) {
	return (
		<Modal
			open={openModalPub}
			onClose={handleModalPub}
		>
			<Box sx={style}>
				<Grid container justifyContent="center">
					<Grid item xs={12}>
						<h3>Are you sure you want to join this channel?</h3>
						<h3><b>{randomSentence()}</b></h3>
					</Grid>
					<Grid item xs={12}>
						<Button 
							variant="contained" 
							color="error"
							onClick={handleModalPub}
						>
							Cancel
						</Button>
						<Button 
							variant="contained" 
							color="success"
							onClick={() => {joinPublicChannel(); handleModalPub()}}
						>
							Join channel
						</Button>
					</Grid>
				</Grid>
			</Box>
		</Modal>
	);
}
