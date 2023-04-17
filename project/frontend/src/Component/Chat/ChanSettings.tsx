import { IconButton, InputAdornment, OutlinedInput, FormControl, InputLabel, Modal, Box, Button, ButtonGroup } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useEffect, useState } from 'react';
import './ChanSettings.css';

const style = {
  success: {
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
  },
  failure: {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'red',
    boxShadow: 24,
    p: 4,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  }
};


function PasswordField({value, setValue} : any) {

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  return (
    <FormControl id='edit-chan-password' variant="outlined">
      <InputLabel htmlFor="new-password">Enter password</InputLabel>
      <OutlinedInput
        autoComplete='off'
        required
        id="new-password"
        value={value}
        onChange={(e: any) => setValue(e.target.value)}
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
  );
}

export default function ChanSettings(props: any) {
  const [name, setName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isProtected, setIsProtected] = useState(false);
  const [error, setError] = useState(false);

  async function handleSubmit(e: any) {
    e.preventDefault();
    if (!name || !name.trim())
      return ;
    try {
      await (props.addChan(name, isProtected? 'PROTECTED' : 'PUBLIC', password));
      setName('');
      setPassword('');
    } catch(e) {
      setError(true);
      setName('');
      setPassword('');
      return ;
    }
  }

  useEffect(() => {
    if (error)
      setTimeout(() => setError(false), 2000);
  }, [error])


  function ChoseMode() {
    return (
          <ButtonGroup variant='outlined' fullWidth={true}>
            <Button onClick={() => setIsProtected(false)} color={isProtected ? 'primary' : 'success'} >
              PUBLIC
            </Button>
            <Button onClick={() => setIsProtected(true)} color={isProtected ? 'success' : 'primary'} >
              PROTECTED
            </Button>
          </ButtonGroup>
    );
  }

  return (
    <div>
      <Modal
        open={props.openEditChan}
        onClose={props.handleEditChanClose}
      >
        <Box sx={error ? style.failure : style.success}  id='edit-chan-form-container'>
          <form onSubmit={handleSubmit} className='create-chan-form'>
            <ChoseMode/>

            <FormControl id='edit-chan-name' variant="outlined">
              <InputLabel htmlFor="new-name">Enter name</InputLabel>
              <OutlinedInput
                autoComplete='off'
                required
                id="new-name"
                onChange={(e) => setName(e.target.value)}
                value={name}
                label="Enter chan name"
              />
            </FormControl>

            {isProtected ? <PasswordField value={password} setValue={setPassword} /> : null }

            <Button style={{color: 'grey'}} sx={{color: 'var(--bleumoch)'}} type="submit" variant='outlined'>
              Create Channel
            </Button>

          </form>
        </Box>
      </Modal>
    </div>
  );
}
