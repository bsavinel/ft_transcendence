import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom'
import "./Pong.css";
import { Socket } from 'socket.io-client';
import { PongSocketContext } from '../../Component/Pong/PongSocketContext';

import wallsAudio from "./sound/wall.mp3"
import paddle1Audio from "./sound/paddle1.mp3"
import paddle2Audio from "./sound/paddle2.mp3"
import bonusAudio from "./sound/bonus.mp3"
import endAudio from "./sound/end.mp3"
import launchAudio from "./sound/launch.mp3"

const wallSound = new Audio(wallsAudio);
const paddle1Sound = new Audio(paddle1Audio);
const paddle2Sound = new Audio(paddle2Audio);
const bonusSound = new Audio(bonusAudio);
const endSound = new Audio(endAudio);
const launchSound = new Audio(launchAudio);

type Position = {
  x: number;
  y: number;
};

type Direction = {
  x: number;
  y: number;
};

interface Spell {
  name: string;
  type: number;
  effect_player: string;
  effect_ball: string;
  speed: number;
  color: string;
}

interface PlayerState
{
  player1Position: {x: number, y: number};
  player2Position: {x: number, y: number};
  player1Score: number;
  player2Score: number;
  player1GetBonus: boolean;
  player2GetBonus: boolean;
  player1ActivateBonus: boolean;
  player2ActivateBonus: boolean;
  whichSpellPlayer1: Spell | null;
  whichSpellPlayer2: Spell | null;
  player1Ready: boolean;
  player2Ready: boolean;
}

interface BallState
{
  ballPosition: {x: number, y: number};
  ballDirection: {x: number, y: number};
  ballSpeed: number;
  ballPower: boolean;
}

interface BonusState
{
  bonusPosition: {x: number, y: number};
  bonusPosition2: {x: number, y: number};
  showBonus: boolean;
  showBonus2: boolean;
  selectedSpell: Spell | null;
  selectedSpell2: Spell | null;
  wall: boolean;
  wall2: boolean;
  timeLeftMindControl: number;
  timeLeftMindControl2: number;
  timeLeftWall: number;
  timeLeftWall2: number;
  heightPaddle: boolean;
  heightPaddle2: boolean;
  heightPaddleScale: number;
  heightPaddleScale2: number;
  timeLeft: number;
  timeLeft2: number;
}

interface GameState
{
  endGame: boolean;
  isPlaying: boolean;
}


const BOARD_WIDTH = 1000;
const BOARD_HEIGHT = 500;

const BALL_RADIUS = 10;
const BALL_SPEED = 7;

const WALL_WIDTH = 10;
const WALL_HEIGH = BOARD_HEIGHT;
const WALL_PLAYER1 = BOARD_WIDTH * 0.33;
const WALL_PLAYER2 = BOARD_WIDTH * 0.66;

const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 80;
const PADDLE_SPEED = 20;

const BONUS_WIDTH = 50;
const BONUS_HEIGHT = 50;
const BONUS_SPEED = 2;
const TIME_LEFT = 5;

const Bonus = ({ position, color }: { position: Position, color?: string }) => {
  return (
    <rect
      x={position.x}
      y={position.y}
      width={BONUS_WIDTH}
      height={BONUS_HEIGHT}
      fill={color}
      stroke="white"
      strokeWidth="2"
    />
  );
};

const Wall = ({ position }: { position: number}) => {
  return (
    <rect
      x={position}
      y={0}
      width={10}
      height={BOARD_HEIGHT}
      fill="black"
      stroke="grey"
      strokeWidth="2"
    />
  );
};

const Paddle = ({ position, effect, height }: { position: Position, effect?: string, height: number }) => {
  return (
    <rect
      x={position.x}
      y={position.y}
      width={PADDLE_WIDTH}
      height={height}
      fill="grey"
      stroke="white"
      strokeWidth="2"
      className={effect}
    />
  );
};

const Ball = ({ position, power, state }: { position: Position, power: boolean, state: boolean }) => {
  return (
    <circle
      cx={position.x}
      cy={position.y}
      r={BALL_RADIUS}
      fill="grey"
      stroke="white"
      strokeWidth="2"
      className={power ? "power_ball" : state ? "" : "waiting_ball"}
    />
  );
};

const Score = ({ score, x }: { score: number, x: number }) => {
  return (
    <text
      x={x}
      y={BOARD_WIDTH / 6}
      fill="grey"
      fontSize="50"
      fontWeight="bold"
      textAnchor="middle"
      stroke="white"
      strokeWidth="2"
    >
    {score}
    </text>
  );
};

const WaitStart = ({text, side}: { text: string, side: string}) => {
  return (
    <text
      x={side === 'left' ? BOARD_WIDTH / 4 : BOARD_WIDTH * 3 / 4}
      y={BOARD_HEIGHT / 2}
      fill="white"
      fontSize="40"
      fontWeight="bold"
      textAnchor="middle"
      stroke="white"
      strokeWidth="2"
      className='winlose'
    >
    {text}
    </text>
  );
};

const WaitStartOther = ({text, side}: { text: string, side: string}) => {
  return (
    <text
      x={side === 'right' ? BOARD_WIDTH / 4 : BOARD_WIDTH * 3 / 4}
      y={BOARD_HEIGHT / 2}
      fill="white"
      fontSize="40"
      fontWeight="bold"
      textAnchor="middle"
      stroke="white"
      strokeWidth="2"
      className='winlose'
    >
    {text}
    </text>
  );
};

const WinLose = ({text}: { text: string}) => {
  return (
    <text
      x={BOARD_WIDTH / 2}
      y={BOARD_HEIGHT / 2}
      fill="white"
      fontSize="80"
      fontWeight="bold"
      textAnchor="middle"
      stroke="white"
      strokeWidth="2"
      className='winlose'
    >
    {text}
    </text>
  );
};

const Redirection = ({timer} : { timer: number}) => {
  return (
    <text
      x={BOARD_WIDTH / 2}
      y={300}
      fill="white"
      fontSize="30"
      fontWeight="bold"
      textAnchor="middle"
    >
    Redirection in {timer} seconds
    </text>
  );
};

const FinalScore = ({score1, score2, side} : { score1: number, score2: number, side: string}) => {
  return (
    <text
      x={BOARD_WIDTH / 2}
      y={400}
      fill="white"
      fontSize="30"
      fontWeight="bold"
      textAnchor="middle"
    >
    Score : {side === 'left' ? score1 : score2} - {side === 'right' ? score1 : score2} 
    </text>
  );
};

const BonusExplication = ({side} : { side: string}) => {
  const bonus = [
    {name: 'Bonus tir vitesse', color: 'yellow'},
    {name: 'Bonus tir diagonale', color: 'green'},
    {name: 'Bonus mur', color: 'red'},
    {name: 'Bonus réduction', color: 'purple'},
  ];

  return (
    <svg viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`}>
      {bonus.map(({name, color}, index) => (
        <g key={index}>
          <rect
            x={side === 'left' ? 150 : 650}
            y={280 + index * 50}
            width={30}
            height={30}
            fill={color}
          />
          <text
            x={side === 'left' ? 200 : 700}
            y={300 + index * 50}
            fontSize="20"
            fontWeight="bold"
            fill="black"
            stroke="white"
            strokeWidth="1"
          >
            {name}
          </text>
        </g>
      ))}
    </svg>
  );
};

const Background = () => {
    return (
      <rect
        x="0"
        y="0"
        width={BOARD_WIDTH}
        height={BOARD_HEIGHT}
        fill="#333333"
        stroke="black"
        strokeWidth="8"
      />
    );
  };

const Middleline = () => {
    return (
      <line
        x1={BOARD_WIDTH / 2}
        y1={0}
        x2={BOARD_WIDTH / 2}
        y2={BOARD_HEIGHT}
        strokeDasharray="10,10"
        stroke="grey"
        strokeWidth="2"
      />
    );
  };

const Board = ({
  timer,
  ballState,
  side,
  winLose,
  sideWin,
  isReady,
  otherReady,
  ballPosition,
  player1Position,
  player2Position,
  player1Score,
  player2Score,
  showBonus,
  showBonus2,
  bonusPosition,
  bonusPosition2,
  ballPower,
  wall,
  wall2,
  blocSpell,
  blocSpell2,
  spell,
  spell2,
  height_paddle1,
  height_paddle2,
  power
}: {
  timer: number;
  ballState: boolean;
  side: string;
  winLose: boolean;
  sideWin: string;
  isReady: boolean;
  otherReady: boolean;
  ballPosition: Position;
  player1Position: Position;
  player2Position: Position;
  player1Score: number;
  player2Score: number;
  showBonus: boolean;
  showBonus2: boolean;
  bonusPosition: Position;
  bonusPosition2: Position;
  ballPower: boolean;
  wall: boolean;
  wall2: boolean;
  blocSpell: Spell | null;
  blocSpell2: Spell | null;
  spell: Spell | null;
  spell2: Spell | null;
  height_paddle1: number;
  height_paddle2: number;
  power: boolean
}) => {
  if (!isReady) {
    if (power)
    {
      return (
      <svg width={BOARD_WIDTH} height={BOARD_HEIGHT} viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`}>
        <Background/>
        <Middleline />
        <WaitStart text={"Press 'SPACE' to start"} side={side}/>
        {!otherReady && <WaitStartOther text={"Waiting for opponent"} side={side}/>}
        <BonusExplication side={side}/>
      </svg>
      );
    }
    else
    {
      return (
      <svg width={BOARD_WIDTH} height={BOARD_HEIGHT} viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`}>
        <Background/>
        <Middleline />
        <WaitStart text={"Press 'SPACE' to start"} side={side}/>
        {!otherReady && <WaitStartOther text={"Waiting for opponent"} side={side}/>}
      </svg>
      );
    }
  }
  if (winLose)
  {
    return (
      <svg width={BOARD_WIDTH} height={BOARD_HEIGHT} viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`}>
        <Background/>
        <WinLose text={sideWin}/>
        <Redirection timer={timer}/>
        <FinalScore score1={player1Score} score2={player2Score} side={side}/>
      </svg>
    );
  }
  return (
    <svg width={BOARD_WIDTH} height={BOARD_HEIGHT} viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`}>
      <Background/>
      <Middleline/>
      <Score score={player1Score} x={BOARD_WIDTH * 0.4} />
      <Score score={player2Score} x={BOARD_WIDTH * 0.6} />
      <Paddle position={player1Position} effect={spell?.effect_player} height={height_paddle1} />
      <Paddle position={player2Position} effect={spell2?.effect_player} height={height_paddle2}/>
      <Ball position={ballPosition} power={ballPower} state={ballState} />
      {!otherReady && <WaitStartOther text={"Waiting for opponent"} side={side}/>}
      {showBonus && <Bonus position={bonusPosition} color={blocSpell?.color}/>}
      {showBonus2 && <Bonus position={bonusPosition2} color={blocSpell2?.color}/>}
      {wall && <Wall position={WALL_PLAYER1}/>}
      {wall2 && <Wall position={WALL_PLAYER2}/>}
    </svg>
  );
};

export default function Game() {
  
  const socket: Socket | null = useContext(PongSocketContext);
  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState<Position>(
    {
      x: 0, y: 0
    }
  );
  const [side, setSide] = useState<string>("");
  const [room, setRoom] = useState<string>("");
  const [sideWin, setSideWin] = useState<string>("");

  const [playerState, setPlayerState] = useState<PlayerState>(
    {
      player1Position: {x: 20, y: BOARD_HEIGHT / 2 - PADDLE_HEIGHT / 2},
      player2Position: {x: BOARD_WIDTH - 30, y: BOARD_HEIGHT / 2 - PADDLE_HEIGHT / 2},
      player1Score: 0,
      player2Score: 0,
      player1GetBonus: false,
      player2GetBonus: false,
      player1ActivateBonus: false,
      player2ActivateBonus: false,
      whichSpellPlayer1: null,
      whichSpellPlayer2: null,
      player1Ready: false,
      player2Ready: false,
    }
  );
    const [ballState, setBallState] = useState<BallState>(
    {
      ballPosition: {x: BOARD_WIDTH / 2, y: BOARD_HEIGHT / 2,},
      ballDirection: {x: 0, y: 0},
      ballSpeed: (BALL_SPEED),
      ballPower: false
    }
  );
  const [bonusState, setBonusState] = useState<BonusState>(
    {
      bonusPosition: {x: 0, y: 0},
      bonusPosition2: {x: 0, y: 0},
      showBonus: true,
      showBonus2: true,
      selectedSpell: null,
      selectedSpell2: null,
      wall: false,
      wall2: false,
      timeLeftMindControl: 0,
      timeLeftMindControl2: 0,
      timeLeftWall: 0,
      timeLeftWall2: 0,
      heightPaddle: false,
      heightPaddle2: false,
      heightPaddleScale: PADDLE_HEIGHT,
      heightPaddleScale2: PADDLE_HEIGHT,
      timeLeft: TIME_LEFT,
      timeLeft2: TIME_LEFT
    }
  );
  const [gameState, setGameState] = useState<GameState>(
    {
      endGame: false,
      isPlaying: false,
    }
  );
  const [powerUp, setPowerUp] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [winLose, setWinLose] = useState<boolean>(false);
  const [otherPlayerReady, setOtherPlayerReady] = useState<boolean>(false);
  const [launchBallTimer, setLaunchBallTimer] = useState<number>(0);
  const [timer, setTimer] = useState<number>(5);
  
  useEffect(() => {
    socket?.emit('pageLoaded');
  }, [socket]);

  useEffect(() => {
    if (!isReady)
    {
      socket?.on("room", (data: any) => setRoom(data.roomId));
      socket?.on("side", (data: any) => setSide(data.side));
      socket?.on("power", (data: any) => setPowerUp(data.power));
      return () => {
        socket?.off("room");
        socket?.off("side");
        socket?.off("power");
      }
    }
}, [socket]);

  useEffect(() => {
    return () => {
      socket?.emit('leavePong');
    };
  }, [socket]);

  useEffect(() => 
  {
    socket?.on('playerLeavePong', () => {
      alert('Opponent disconnected');
    })
    return () => {socket?.off('playerLeavePong')}
  }, [socket]);


  useEffect(() => 
  {
    socket?.on('otherPlayerReady', () => {
      setOtherPlayerReady(true);
    })
    return () => {socket?.off('otherPlayerReady')}
  }, [socket, otherPlayerReady]);


  useEffect(() => 
  {
    socket?.on('launchBallTimer', (data) => {
      setLaunchBallTimer(data.timer);
    })
    return () => {
      socket?.off('launchBallTimer')
    }
  }, [socket, launchBallTimer]);


  useEffect(() => 
  {
    const timerLaunchBall = setInterval(() => {
      if (launchBallTimer > 0) {
        console.log(launchBallTimer);
        setLaunchBallTimer(prevTimer => prevTimer - 1);
      }
    }, 1000);
    return () => clearInterval(timerLaunchBall);
  }, [launchBallTimer]); 


  useEffect(() => 
  {
    if (!winLose)
    {
      const handleKeyDown = (event: KeyboardEvent) => 
      {
        switch (event.key)
        {
          case ' ':
            event.preventDefault();
            socket?.emit('playerReady', {roomId: room, side: side});
            setIsReady(true);
            break;
          default:
            break;
        };
      }
      
      window.addEventListener('keydown', handleKeyDown);
      
      return () => {window.removeEventListener('keydown', handleKeyDown);};
    }
  }, [room, side]);


  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const gameBoard = document.querySelector('.gameboard');
      if (gameBoard)
      {
        const pongRect = gameBoard.getBoundingClientRect();
        const mouseY = event.clientY - pongRect.top;
        setMousePos({ x: 0, y: mouseY});
        socket?.emit('mousePosition', {roomId: room, side: side, mousePos: mousePos});
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => 
    {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [mousePos, room, side])

  
  useEffect(() => {
    const handleMouseClick = (event: MouseEvent) => {
      if (event)
      {
        event.preventDefault();
        socket?.emit('launchSpell', {roomId: room, side: side});
      }
    };

    window.addEventListener('click', handleMouseClick);

    return () => 
    {
      window.removeEventListener('click', handleMouseClick);
    };
  }, [room, side])

  if (powerUp)
  {
    useEffect(() => {
      socket?.emit("startGamePowerUp", {roomId: room});
      socket?.on("updatePowerUp", (data: any) =>
      {
        setPlayerState(data.player)
        setBonusState(data.bonus)
        setBallState(data.ball)
        setGameState(data.game)
      });
      return () => {
        socket?.off("updatePowerUp");
      }
    }, [room, playerState, ballState, bonusState, gameState, socket])
  }
  else
  {
    useEffect(() => {
      socket?.emit("startGame", {roomId: room});
      socket?.on("update", (data: any) =>
      {
        setPlayerState(data.player)
        setBonusState(data.bonus)
        setBallState(data.ball)
        setGameState(data.game)
      });
      return () => {
        socket?.off("update");
      }
    }, [room, playerState, bonusState, ballState, gameState, socket])
  }

  useEffect(() =>
  {
    socket?.on('playerWinLose', (sideWin: string) => {
      setSideWin(sideWin);
      setWinLose(true);
    });
    return () => {
      socket?.off("playerWinLose");
    }
  }, [socket, sideWin, winLose]);
  
  useEffect(() => {
    if (winLose)
    {
      const timer_wall = setInterval(() => {
        if (timer > 0) {
          setTimer(prevTimer => prevTimer - 1);
        }
      }, 1000);
      return () => clearInterval(timer_wall);
    }
  }, [winLose, timer]);

  useEffect(() =>
  {
    if (winLose)
    {
      setTimeout(() => {
        navigate("/game");
      }, 5000)
    }
  }, [winLose]);


  useEffect(() =>
  {
    socket?.on("endAudio", () => {
      endSound.play();
    })
    socket?.on("paddle1Audio", () => {
      paddle1Sound.play();
    })
    socket?.on("paddle2Audio", () => {
      paddle2Sound.play();
    })
    socket?.on("bonusAudio", () => {
      bonusSound.play();
    })
    socket?.on("wallsAudio", () => {
      wallSound.play();
    })
    socket?.on("launchAudio", () => {
      launchSound.play();
    })
    return () => {
      socket?.off("endAudio")
      socket?.off("paddle1Audio")
      socket?.off("paddle2Audio")
      socket?.off("bonusAudio")
      socket?.off("wallsAudio")
      socket?.off("launchAudio")
    }
  }, [socket]);
  
  return (
    <svg className='gameboard' viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`}>
    <Board timer={timer}
      ballState={gameState.isPlaying}
      side={side}
      winLose={winLose}
      sideWin={sideWin === side ? 'You won' : 'You lost'}
      isReady={isReady}
      otherReady={otherPlayerReady}
      ballPosition={ballState.ballPosition}
      player1Position={playerState.player1Position}
      player2Position={playerState.player2Position}
      player1Score={playerState.player1Score} 
      player2Score={playerState.player2Score}
      showBonus={bonusState.showBonus}
      showBonus2={bonusState.showBonus2}
      bonusPosition={bonusState.bonusPosition}
      bonusPosition2={bonusState.bonusPosition2}
      ballPower={ballState.ballPower}
      wall={bonusState.wall}
      wall2={bonusState.wall2}
      blocSpell={bonusState.selectedSpell}
      blocSpell2={bonusState.selectedSpell2}
      spell={playerState.whichSpellPlayer1}
      spell2={playerState.whichSpellPlayer2}
      height_paddle1={bonusState.heightPaddleScale}
      height_paddle2={bonusState.heightPaddleScale2}
      power={powerUp}
      />
  </svg>
  );
};

