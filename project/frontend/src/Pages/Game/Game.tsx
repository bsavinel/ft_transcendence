import { Link, Outlet, Route, Routes, useNavigate } from 'react-router-dom'
import { useEffect } from 'react';
import "./Game.css";
import React, { useState, useContext } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import { Socket } from 'socket.io-client';
import { PongSocketContext } from '../../Component/Pong/PongSocketContext';


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
  const [openRulesClassic, setOpenRulesClassic] = useState<boolean>(false);
  const [openRulesPower, setOpenRulesPower] = useState<boolean>(false);
  const socket: Socket | null = useContext(PongSocketContext);

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
    socket?.emit("joinMatchmaking");
  };

  const handleClosePlayOnline = () => {
    setIsOpenPlayOnline(false);
    socket?.emit("leaveMatchmaking");
  };

  const handleOpenPlayOnlinePowerUp = () => {
    setIsOpenPlayOnlinePowerUp(true);
    socket?.emit("joinMatchmakingPowerUp");
  };

  const handleClosePlayOnlinePowerUp = () => {
    setIsOpenPlayOnlinePowerUp(false);
    socket?.emit("leaveMatchmakingPowerUp");
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

  const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
      children: React.ReactElement<any, any>;
    },
    ref: React.Ref<unknown>,
  ) {
    return <Slide direction="up" ref={ref} {...props} />;
  });

  const handleOpenRulesClassic = () => {
    setOpenRulesClassic(true);
  };

  const handleCloseRulesClassic = () => {
    setOpenRulesClassic(false);
  };

  const handleOpenRulesPower = () => {
    setOpenRulesPower(true);
  };

  const handleCloseRulesPower = () => {
    setOpenRulesPower(false);
  };

  const SoloPong = () => {
    return (
      <div className='section2'>
        <h2 className='title2'>Solo</h2>
        <Button sx={{ width: '30%', borderRadius: '5px'}} variant="contained" color="inherit" onClick={handleOpenPlaySolo}>Lancer une partie</Button>
        <Dialog open={isOpenPlaySolo} onClose={handleClosePlaySolo}
        PaperProps={{
          style: {
            backgroundColor: 'grey',
          },
        }}>
          <Box sx={{ width: 400 }}>
          <h1 style={{ fontSize: '25px' }}>Solo contre IA</h1>
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
          <Button variant="contained" color="inherit" onClick={handleLaunchSolo}>PLAY</Button>
          <DialogActions>
            <Button onClick={handleClosePlaySolo} color="inherit">
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
        <h2 className='title2'>Online</h2>
          <Button sx={{ width: '35%', borderRadius: '5px'}} variant="contained" color="inherit" onClick={handleOpenPlayOnline}>Matchmaking Classic</Button>
          <Dialog open={isOpenPlayOnline} onClose={handleClosePlayOnline} 
          PaperProps={{
            style: {
              backgroundColor: 'grey',
            },
          }}>
            <h1 style={{ fontSize: '25px' }}>Classic Online</h1>
            <DialogContent>
              {playerAvailable && <p>Joueur trouvé !</p>}
              {!playerAvailable && <p>En attente d'un autre joueur...</p>}
            </DialogContent>
            <Box sx={{ width: 400 }}>
              {!playerAvailable && <LinearProgress />}
              {playerAvailable && <LinearProgress variant="determinate" value={progress} />}
            </Box>
            <DialogActions>
              <Button onClick={handleClosePlayOnline} color="inherit">
                Annuler
              </Button>
            </DialogActions>
          </Dialog>
  
          <Button sx={{ width: '35%', borderRadius: '5px'}} variant="contained" color="inherit" onClick={handleOpenPlayOnlinePowerUp}>Matchmaking Power</Button>
          <Dialog open={isOpenPlayOnlinePowerUp} onClose={handleClosePlayOnlinePowerUp}
          PaperProps={{
            style: {
              backgroundColor: 'grey',
            },
          }}>
            <h1 style={{ fontSize: '25px' }}>Power Online</h1>
            <DialogContent>
              {!playerAvailable && <p>En attente d'un autre joueur...</p>}
              {playerAvailable && <p>Joueur trouvé !</p>}
            </DialogContent>
            <Box sx={{ width: 400 }}>
              {!playerAvailable && <LinearProgress />}
              {playerAvailable && <LinearProgress variant="determinate" value={progress} />}
            </Box>
            <DialogActions>
              <Button onClick={handleClosePlayOnlinePowerUp} color="inherit">
                Annuler
              </Button>
            </DialogActions>
          </Dialog>
      </div>
    );
  };

  const Rules = () => {
    return (
      <div className='section2'>
        <h2 className='title2'>Regles</h2>
        <Button variant="contained" color="inherit" onClick={handleOpenRulesClassic}>
        Classic
        </Button>
        <Dialog
          open={openRulesClassic}
          TransitionComponent={Transition}
          keepMounted
          onClose={handleCloseRulesClassic}
          aria-describedby="alert-dialog-slide-description"
          PaperProps={{
            style: {
              backgroundColor: 'grey',
            },
          }}
        >
          <h1 style={{ fontSize: '25px' }}>{"Regles Pong Classic"}</h1>
          <DialogContent>
            <p>
            Le jeu oppose deux joueurs, chacun contrôlant un paddle à l'aide de leur souris. <br/>
            Au debut du jeu et après chaque point marqué, il y a un délai de 3 secondes avant que la balle ne soit relancée. <br/>
            Le but est de marquer des points en faisant passer la balle derrière le paddle de l'adversaire. <br/>
            Le premier joueur à atteindre 11 points remporte la partie. <br/>
            La vitesse de la balle augmente à chaque fois qu'elle touche un paddle, rendant le jeu de plus en plus difficile. <br/>
            Si un joueur se deconnecte ou quitte la partie en cours, il est considéré comme perdant peu importe le score. <br/>
            </p>
          </DialogContent>
        </Dialog>
        <Button variant="contained" color="inherit" onClick={handleOpenRulesPower}>
        Power
        </Button>
        <Dialog
          open={openRulesPower}
          TransitionComponent={Transition}
          keepMounted
          onClose={handleCloseRulesPower}
          aria-describedby="alert-dialog-slide-description"
          PaperProps={{
            style: {
              backgroundColor: 'grey',
            },
          }}
        >
          <h1 style={{ fontSize: '25px' }}>{"Regles Pong Power"}</h1>
          <DialogContent>
            <p>
            Le jeu oppose deux joueurs, chacun contrôlant un paddle à l'aide de leur souris. <br/>
            Au debut du jeu et après chaque point marqué, il y a un délai de 3 secondes avant que la balle ne soit relancée. <br/>
            Le but est de marquer des points en faisant passer la balle derrière le paddle de l'adversaire. <br/>
            Le premier joueur à atteindre 11 points remporte la partie. <br/>
            Si un joueur se deconnecte ou quitte la partie en cours, il est considéré comme perdant peu importe le score. <br/>

            Ce mode comporte 4 pouvoirs différents, qui peuvent être acqueris en touchant un bloc spécial qui tombe sur le terrain. Il faut ensuite appuyer sur le clic gauche pour activer le pouvoir. <br/>
            <br/>
            Les pouvoirs disponibles sont : <br/>
            <br/>
            Bloc rouge : crée un mur qui bloque la balle pendant quelques secondes, empêchant l'adversaire de la toucher. <br/>
            Bloc violet : rétrécit le paddle de l'adversaire, le rendant plus difficile à contrôler. <br/>
            Bloc vert : envoie la balle en l'air avec un petit angle, permettant au joueur de l'envoyer dans des zones plus difficiles d'accès pour l'adversaire. <br/>
            Bloc jaune : tire la balle horizontalement à haute vitesse, permettant de surprendre l'adversaire et de marquer un point facilement. <br/>
            </p>
          </DialogContent>
        </Dialog>
      </div>
    );
  };
  

  useEffect(() => {
    if (isOpenPlayOnline) {
      socket?.on('connect', () => {
        console.log('Connected');
      });
    }
    else if (!isOpenPlayOnline)
    {
      socket?.on("disconnect", (reason) => {
        if (reason === "io server disconnect") {
          // the disconnection was initiated by the server, you need to reconnect manually
          socket?.connect();
        }
        // else the socket? will automatically try to reconnect
      });
    }
  }, [isOpenPlayOnline]); 

  useEffect(() => {
    socket?.on("launchOn", (launch: boolean) => {setLaunchGame(launch)});
  }, [launchGame, socket]);

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
      <div>
        <SoloPong />
        <OnlinePong />
        <Rules />
      </div>
      <h1 className='title12'>PONG GAME</h1>
    </div>
  );
}
