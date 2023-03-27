import { IconButton, InputAdornment, OutlinedInput, FormControl, InputLabel, Modal, Box } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useState } from 'react';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

export default function ChanSettings(props: any) {
    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

  return (
    <div>
      <Modal
        open={props.openEditChan}
        onClose={props.handleEditChanClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} id='edit-chan-form-container'>
            <FormControl id='edit-chan-name' sx={{m: '5px', width: '80%'}} variant="outlined">
                <InputLabel htmlFor="new-name">Enter new name</InputLabel>
                <OutlinedInput
                    id="new-name"
                    label="Enter new password"
                    onKeyDown={props.changeChanName}
                />
            </FormControl>

            <FormControl id='edit-chan-passwrd' sx={{m: '5px', width: '80%'}} variant="outlined">
                <InputLabel htmlFor="new-password">Enter new password</InputLabel>
                <OutlinedInput
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    endAdornment={
                        <InputAdornment position="end">
                            <IconButton
                                onClick={handleClickShowPassword}
                                onMouseDown={handleMouseDownPassword}
                                edge="end"
                            >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    }
                    label="Enter new password"
                />
            </FormControl>
        </Box>
      </Modal>
    </div>
  );
}
