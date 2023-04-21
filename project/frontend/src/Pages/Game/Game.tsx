import { Link, Outlet, Route, Routes, useNavigate } from 'react-router-dom'
import { useEffect } from 'react';
import "./Game.css";
import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { socket } from '../../Component/Pong/PongSocketContext';



export default function HomeGame() {
  const [isOpenPlayOnline, setIsOpenPlayOnline] = useState<boolean>(false);
  const [isOpenPlayOnlinePowerUp, setIsOpenPlayOnlinePowerUp] = useState<boolean>(false);
  const [isOpenPlaySolo, setIsOpenPlaySolo] = useState<boolean>(false);
  const [launchsolo, setLaunchSolo] = useState<boolean>(false);
  const [launchGame, setLaunchGame] = useState<boolean>(false);
  const [playerAvailable, setPlayerAvailable] = useState<boolean>(false);
  const [timeOut, setTimeOut] = useState<NodeJS.Timeout>();
  const [levelValue, setLevelValue] = useState<string>("1");
  const [progress, setProgress] = useState<number>(25);
  let progressValue = 25;

  const navigate = useNavigate();


  useEffect(() => {
    if (playerAvailable)
    {  
      const interval = setInterval(() => {
        progressValue += 25;
        setProgress(progressValue);
        if (progressValue === 100)
          clearInterval(interval);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [playerAvailable]);

  const handleChange = (event: SelectChangeEvent) => {
    setLevelValue(event.target.value as string);
  };

  const handleOpenPlayOnline = () => {
    setIsOpenPlayOnline(true);
    socket.emit("joinMatchmaking");
  };

  const handleClosePlayOnline = () => {
    setIsOpenPlayOnline(false);
    socket.emit("leaveMatchmaking");
  };

  const handleOpenPlayOnlinePowerUp = () => {
    setIsOpenPlayOnlinePowerUp(true);
    socket.emit("joinMatchmakingPowerUp");
  };

  const handleClosePlayOnlinePowerUp = () => {
    setIsOpenPlayOnlinePowerUp(false);
    socket.emit("leaveMatchmakingPowerUp");
  };

  const handleOpenPlaySolo = () => {
    setIsOpenPlaySolo(true);
  };

  const handleClosePlaySolo = () => {
    setIsOpenPlaySolo(false);
  };

  const handleLaunchSolo = () => {
    setIsOpenPlaySolo(false);
    navigate(`/game/pong-solo?level=${levelValue}`)
  };

  const SoloPong = () => {
    return (
      <div className='section2'>
        <h2 className='title2'>SOLO</h2>
        <p>Le Pong solo vous permet d'affronter une intelligence artificielle avec les pouvoirs. Choisissez le niveau de difficulté qui vous convient et appuyez sur le bouton "PLAY".</p>
        <Button sx={{ width: '30%', borderRadius: '25px'}} variant="contained" color="primary" onClick={handleOpenPlaySolo}>Lancer une partie</Button>
        <Dialog open={isOpenPlaySolo} onClose={handleClosePlaySolo}>
          <DialogTitle>Choisis le niveau de jeu</DialogTitle>
          <Box sx={{ width: 400 }}>
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">Niveau</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={levelValue}
                label="Level"
                onChange={handleChange}
                sx={{textAlign: 'center'}}
              >
                <MenuItem value={1}>Facile</MenuItem>
                <MenuItem value={2}>Normal</MenuItem>
                <MenuItem value={3}>Difficile</MenuItem>
                <MenuItem value={4}>Impossible</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Button variant="contained" color="primary" onClick={handleLaunchSolo}>PLAY</Button>
          <DialogActions>
            <Button onClick={handleClosePlaySolo} color="primary">
              Annuler
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  };
  
  const OnlinePong = () => {
    return (
      <div className='section2'>
        <h2 className='title2'>ONLINE</h2>
        <p>Le Pong en ligne est un jeu où vous jouez contre un autre joueur en temps réel. Vous pouvez joeur en mode classic ou avec les pouvoirs. Appuyez sur le mode qui vous convient pour lancer la recherche d'un adversaire.</p>
          <Button sx={{ width: '35%', borderRadius: '25px'}} variant="contained" color="primary" onClick={handleOpenPlayOnline}>Matchmaking Classic</Button>
          <Dialog className='dialog-point' open={isOpenPlayOnline} onClose={handleClosePlayOnline}>
            <DialogTitle>Pong Classic Online</DialogTitle>
            <DialogContent>
              {playerAvailable && <p>Joueur trouvé !</p>}
              {!playerAvailable && <p>En attente d'un autre joueur...</p>}
            </DialogContent>
            <Box sx={{ width: 400 }}>
              {!playerAvailable && <LinearProgress />}
              {playerAvailable && <LinearProgress variant="determinate" value={progress} />}
            </Box>
            <DialogActions>
              <Button onClick={handleClosePlayOnline} color="primary">
                Annuler
              </Button>
            </DialogActions>
          </Dialog>
  
          <Button sx={{ width: '35%', borderRadius: '25px'}} variant="contained" color="primary" onClick={handleOpenPlayOnlinePowerUp}>Matchmaking Power</Button>
          <Dialog className='dialog-point' open={isOpenPlayOnlinePowerUp} onClose={handleClosePlayOnlinePowerUp}>
            <DialogTitle>Pong Power Online</DialogTitle>
            <DialogContent>
              {!playerAvailable && <p>En attente d'un autre joueur...</p>}
              {playerAvailable && <p>Joueur trouvé !</p>}
            </DialogContent>
            <Box sx={{ width: 400 }}>
              {!playerAvailable && <LinearProgress />}
              {playerAvailable && <LinearProgress variant="determinate" value={progress} />}
            </Box>
            <DialogActions>
              <Button onClick={handleClosePlayOnlinePowerUp} color="primary">
                Annuler
              </Button>
            </DialogActions>
          </Dialog>
      </div>
    );
  };
  

  useEffect(() => {
    if (isOpenPlayOnline) {
      socket.on('connect', () => {
        console.log('Connected');
      });
    }
    else if (!isOpenPlayOnline)
    {
      socket.on("disconnect", (reason) => {
        console.log('REASON = ', reason);
        if (reason === "io server disconnect") {
          // the disconnection was initiated by the server, you need to reconnect manually
          socket.connect();
        }
        // else the socket will automatically try to reconnect
      });
    }
  }, [isOpenPlayOnline]);

  useEffect(() => {
    socket.on("launchOn", launch => {setLaunchGame(launch)});
  }, [launchGame]);

  useEffect(() => {
    if (launchGame)
    {
      setPlayerAvailable(true);
      setTimeOut(setTimeout(() => {
        setLaunchGame(false);
        setIsOpenPlayOnline(false);
        setIsOpenPlayOnlinePowerUp(false);
        navigate("/game/pong-online")
      }, 4000))
    }
    return () => clearTimeout(timeOut);
  }, [launchGame, isOpenPlayOnline]);

  return (
    <div className="container">
      <h1 className='title1'>PONG GAME</h1>
      <div className='divBase'>
        <SoloPong />
        <OnlinePong />
      </div>
      <h1 className='title12'>PONG GAME</h1>
    </div>

    
  );
}
