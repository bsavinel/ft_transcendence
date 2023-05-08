import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'
import "./Pong.css";
import {spells} from "./Spell"
import { Position, Direction, Spell } from './types';
import queryString from 'query-string';

import wallsAudio from "./sound/wall.mp3"
import paddle1Audio from "./sound/paddle1.mp3"
import paddle2Audio from "./sound/paddle2.mp3"
import bonusAudio from "./sound/bonus.mp3"
import endAudio from "./sound/end.mp3"
import launchAudio from "./sound/launch.mp3"
import { Ballot } from '@mui/icons-material';

const wallSound = new Audio(wallsAudio);
const paddle1Sound = new Audio(paddle1Audio);
const paddle2Sound = new Audio(paddle2Audio);
const bonusSound = new Audio(bonusAudio);
const endSound = new Audio(endAudio);
const launchSound = new Audio(launchAudio);


const BOARD_WIDTH = 1000;
const BOARD_HEIGHT = 500;
const BALL_RADIUS = 10;
const WALL_WIDTH = 10;
const WALL_HEIGH = BOARD_HEIGHT;
const WALL_PLAYER1 = BOARD_WIDTH * 0.33;
const WALL_PLAYER2 = BOARD_WIDTH * 0.66;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 80;
const BONUS_WIDTH = 50;
const BONUS_HEIGHT = 50;
const BONUS_SPEED = 5;
const TIME_LEFT = 5;
const SCORE_LIMIT = 11;
const STROKE = 2;
const TIME_LAUNCH_BALL = 2;

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

const WaitStart = ({text}: { text: string}) => {
  return (
    <text
      x={BOARD_WIDTH / 2}
      y={BOARD_HEIGHT / 2}
      fill="white"
      fontSize="50"
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
      fontSize="40"
      fontWeight="bold"
      textAnchor="middle"
    >
    Redirection in {timer} seconds
    </text>
  );
};

const BonusExplication = () => {
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
            x={310}
            y={280 + index * 50}
            width={35}
            height={35}
            fill={color}
          />
          <text
            x={380}
            y={310 + index * 50}
            fontSize="25"
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
        strokeWidth="5"
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
  ballState,
  winLose,
  sideWin,
  isReady,
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
  height_paddle2
}: {
  ballState: boolean;
  winLose: boolean;
  sideWin: string;
  isReady: boolean;
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
  height_paddle2: number
}) => {
  if (!isReady) {
    return (
    <svg width={BOARD_WIDTH} height={BOARD_HEIGHT} viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`}>
      <Background/>
      <WaitStart text={"Press 'SPACE' to start"}/>
      <BonusExplication />
    </svg>
    );
  }
  if (winLose)
  {
    const [timer, setTimer] = useState(5);

    useEffect(() => {
      const timer_wall = setInterval(() => {
        if (timer > 0) {
          setTimer(prevTimer => prevTimer - 1);
        }
      }, 1000);
      return () => clearInterval(timer_wall);
    }, [timer]);

    return (
      <svg width={BOARD_WIDTH} height={BOARD_HEIGHT} viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`}>
        <Background/>
        <WinLose text={sideWin}/>
        <Redirection timer={timer}/>
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
      {showBonus && <Bonus position={bonusPosition} color={blocSpell?.color}/>}
      {showBonus2 && <Bonus position={bonusPosition2} color={blocSpell2?.color}/>}
      {wall && <Wall position={WALL_PLAYER1}/>}
      {wall2 && <Wall position={WALL_PLAYER2}/>}
    </svg>
  );
};

export default function GameSolo(props: any) {
  const values = queryString.parse(props.location.search);
  const level = typeof values.level === 'string' ? parseInt(values.level) : 1;

  const [ballPosition, setBallPosition] = useState<Position>({x: BOARD_WIDTH / 2, y: BOARD_HEIGHT / 2,});
  const [ballDirection, setBallDirection] = useState<Direction>({x: Math.random() > 0.5 ? 1 : -1, y: Math.random() > 0.5 ? 0.5 : -0.5});
  const [player1Position, setPlayer1Position] = useState<Position>({x: 20, y: BOARD_HEIGHT / 2 - PADDLE_HEIGHT / 2,});
  const [player2Position, setPlayer2Position] = useState<Position>({x: BOARD_WIDTH - 30, y: BOARD_HEIGHT / 2 - PADDLE_HEIGHT / 2,});
  const [player1Score, setPlayer1Score] = useState<number>(0);
  const [player2Score, setPlayer2Score] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [mousePos, setMousePos] = useState<Position>({x: BOARD_WIDTH / 2, y: BOARD_HEIGHT / 2,});

  
  const [ballPower, setBallPower] = useState<boolean>(false);
  const [selectedSpell, setSelectedSpell] = useState<Spell | null>(spells[Math.floor(Math.random() * 4)]);
  const [selectedSpell2, setSelectedSpell2] = useState<Spell | null>(spells[Math.floor(Math.random() * 4)]);
  const [whichSpellPlayer1, setWhichSpellPlayer1] = useState<Spell | null>(null);
  const [whichSpellPlayer2, setWhichSpellPlayer2] = useState<Spell | null>(null);

  const [wall, setWall] = useState<boolean>(false);
  const [wall2, setWall2] = useState<boolean>(false);

  const [timeLeftMindControl, setTimeLeftMindControl] = useState<number>(0);
  const [timeLeftMindControl2, setTimeLeftMindControl2] = useState<number>(0);
  const [timeLeftWall, setTimeLeftWall] = useState<number>(0);
  const [timeLeftWall2, setTimeLeftWall2] = useState<number>(0);
  const [heightPaddle, setHeightPaddle] = useState<boolean>(false);
  const [heightPaddle2, setHeightPaddle2] = useState<boolean>(false);
  const [heightPaddleScale, setHeightPaddleScale] = useState<number>(PADDLE_HEIGHT);
  const [heightPaddleScale2, setHeightPaddleScale2] = useState<number>(PADDLE_HEIGHT);

  const [timeLeft, setTimeLeft] = useState<number>(TIME_LEFT);
  const [timeLeft2, setTimeLeft2] = useState<number>(TIME_LEFT);
  const [bonusPosition, setBonusPosition] = useState<Position>({x: (BOARD_WIDTH * 0.25), y: -BONUS_HEIGHT});
  const [bonusPosition2, setBonusPosition2] = useState<Position>({x: (BOARD_WIDTH * 0.75), y: -BONUS_HEIGHT});
  const [showBonus, setShowBonus] = useState<boolean>(false);
  const [showBonus2, setShowBonus2] = useState<boolean>(false);
  const [player1GetBonus, setplayer1GetBonus] = useState<boolean>(false);
  const [player2GetBonus, setplayer2GetBonus] = useState<boolean>(false);
  const [player1ActivateBonus, setplayer1ActivateBonus] = useState<boolean>(false);
  const [player2ActivateBonus, setplayer2ActivateBonus] = useState<boolean>(false);
  const [endGame, setEndGame] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  const navigate = useNavigate();
  
  let IA_SPEED: number = 1;
  let BALL_SPEED: number = 1;

  if (level === 1)
  {
    IA_SPEED = 10;
    BALL_SPEED = 7;
  }
  else if (level === 2)
  {
    IA_SPEED = 15;
    BALL_SPEED = 8;
  }
  else if (level === 3)
  {
    IA_SPEED = 20;
    BALL_SPEED = 10;
  }
  else if (level === 4)
  {
    IA_SPEED = 30;
    BALL_SPEED = 14;
  }
  
  const [ballSpeed, setBallSpeed] = useState<number>(BALL_SPEED);

  function playWallSound() {
    wallSound.play();
  }

  function playPaddle1Sound() {
    paddle1Sound.play();
  }

  function playPaddle2Sound() {
    paddle2Sound.play();
  }

  function playBonusSound() {
    bonusSound.play();
  }

  function playEndSound() {
    endSound.play();
  }

  function playLaunchSound() {
    launchSound.play();
  }

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search); // récupère les paramètres de l'URL
    const urlLevel = urlParams.get('level'); // récupère la valeur du paramètre level dans l'URL

    if (urlLevel !== values.level || isNaN(level) || level < 1 || level > 4) {
      navigate('/game');
    }
  }, [level]);

  function hitScenery() {
    if (ballPosition.y - BALL_RADIUS <= 0 && ballDirection.y < 0) // Touche le plafond
    {
      playWallSound();
      setBallDirection((prev) => ({x: prev.x, y: -prev.y,}));
    }
    else if (ballPosition.y + BALL_RADIUS >= BOARD_HEIGHT && ballDirection.y > 0) // Touche le sol
    {
      playWallSound();
      setBallDirection((prev) => ({x: prev.x, y: -prev.y,}));
    }
    else if (ballPosition.x - BALL_RADIUS <= 0 && ballDirection.x < 0) // Touche le mur gauche
    {
      playEndSound();
      setIsPlaying(false);
      setPlayer2Score((prev) => prev + 1);
      setBallPosition(({x: BOARD_WIDTH / 2, y: BOARD_HEIGHT / 2,}));
      setBallDirection(({x: Math.random() > 0.5 ? 1 : -1, y: Math.random() > 0.5 ? 0.5 : -0.5}));
      setPlayer2Position({x: BOARD_WIDTH - 30, y: BOARD_HEIGHT / 2 - PADDLE_HEIGHT / 2});
      setplayer1GetBonus(false);
      setplayer2GetBonus(false);
      setplayer1ActivateBonus(false);
      setplayer2ActivateBonus(false);
      setShowBonus(false);
      setShowBonus2(false);
      setBallSpeed(BALL_SPEED);
      setTimeLeft(TIME_LEFT);
      setTimeLeft2(TIME_LEFT);
      setBonusPosition({x: (BOARD_WIDTH * 0.25), y: -BONUS_HEIGHT});
      setBonusPosition2({x: (BOARD_WIDTH * 0.75), y: -BONUS_HEIGHT});
      setWall(false);
      setWall2(false);
      setTimeLeftMindControl(0);
      setTimeLeftMindControl2(0);
      setTimeLeftWall(0);
      setTimeLeftWall2(0);
      setWhichSpellPlayer1(null);
      setWhichSpellPlayer2(null);
      setBallPower(false);
      setTimeout(() => {
        setIsPlaying(true);
      }, TIME_LAUNCH_BALL * 1000);
    }
    else if (ballPosition.x + BALL_RADIUS >= BOARD_WIDTH && ballDirection.x > 0) // Touche le mur droite
    {
      playEndSound();
      setIsPlaying(false);
      setPlayer1Score((prev) => prev + 1);
      setBallPosition(({x: BOARD_WIDTH / 2, y: BOARD_HEIGHT / 2,}));
      setBallDirection(({x: Math.random() > 0.5 ? 1 : -1, y: Math.random() > 0.5 ? 0.5 : -0.5}));
      setPlayer2Position({x: BOARD_WIDTH - 30, y: BOARD_HEIGHT / 2 - PADDLE_HEIGHT / 2});
      setplayer1GetBonus(false);
      setplayer2GetBonus(false);
      setplayer1ActivateBonus(false);
      setplayer2ActivateBonus(false);
      setShowBonus(false);
      setShowBonus2(false);
      setBallSpeed(BALL_SPEED);
      setTimeLeft(TIME_LEFT);
      setTimeLeft2(TIME_LEFT);
      setBonusPosition({x: (BOARD_WIDTH * 0.25), y: -BONUS_HEIGHT});
      setBonusPosition2({x: (BOARD_WIDTH * 0.75), y: -BONUS_HEIGHT});
      setWall(false);
      setWall2(false);
      setTimeLeftMindControl(0);
      setTimeLeftMindControl2(0);
      setTimeLeftWall(0);
      setTimeLeftWall2(0);
      setWhichSpellPlayer1(null);
      setWhichSpellPlayer2(null);
      setBallPower(false);
      setTimeout(() => {
        setIsPlaying(true);
      }, TIME_LAUNCH_BALL * 1000);
    }
    else if (ballPosition.x - BALL_RADIUS <= player1Position.x + PADDLE_WIDTH && ballPosition.y >= player1Position.y && ballPosition.y <= player1Position.y + heightPaddleScale && ballDirection.x < 0)
    {
      setBallPower(false);
      if ( ballPosition.y > player1Position.y && ballPosition.y < player1Position.y + (heightPaddleScale / 5) ) 
      {
        setBallDirection(({x: 1, y: Math.random() * -2.5}));
      }
      else if ( ballPosition.y  >= player1Position.y + (heightPaddleScale / 5) && ballPosition.y  < player1Position.y + (heightPaddleScale / 5) * 2 ) 
      {
        setBallDirection(({x: 1, y: Math.random() * -2}));
      }
      else if ( ballPosition.y  >= player1Position.y + (heightPaddleScale / 5) * 2 && ballPosition.y  < player1Position.y + heightPaddleScale - (heightPaddleScale / 5) ) 
      {
        setBallDirection(({x: 1, y: Math.random() * 2}));
      }
      else if ( ballPosition.y  >= player1Position.y + heightPaddleScale - (heightPaddleScale / 5) && ballPosition.y < player1Position.y + heightPaddleScale ) 
      {
        setBallDirection(({x: 1, y: Math.random() * 2.5}));
      }
      else
      {
        setBallDirection(({x: 1, y: Math.random() * 0.5}));
      }
      setBallSpeed(BALL_SPEED);
      playPaddle1Sound();
      if (player1ActivateBonus)
      {
        setBallPower(true);
        if (whichSpellPlayer1?.name == "Super strike")
          power_superstrike(1);
        else if (whichSpellPlayer1?.name == "Swing")
          power_swing(1);
        
        setplayer1ActivateBonus(false);
        setWhichSpellPlayer1(null);
      }
    }
    else if (ballPosition.x + BALL_RADIUS >= player2Position.x && ballPosition.y >= player2Position.y && ballPosition.y <= player2Position.y + heightPaddleScale2 && ballDirection.x > 0)
    {
      setBallPower(false);
      if ( ballPosition.y > player1Position.y && ballPosition.y < player1Position.y + (heightPaddleScale2 / 5) ) 
      {
        setBallDirection(({x: -1, y: Math.random() * -2.5}));
      }
      else if ( ballPosition.y  >= player1Position.y + (heightPaddleScale2 / 5) && ballPosition.y  < player1Position.y + (heightPaddleScale2 / 5) * 2 ) 
      {
        setBallDirection(({x: -1, y: Math.random() * -2}));
      }
      else if ( ballPosition.y  >= player1Position.y + (heightPaddleScale2 / 5) * 2 && ballPosition.y  < player1Position.y + heightPaddleScale2 - (heightPaddleScale2 / 5) ) 
      {
        setBallDirection(({x: -1, y: Math.random() * 2}));
      }
      else if ( ballPosition.y  >= player1Position.y + heightPaddleScale2 - (heightPaddleScale2 / 5) && ballPosition.y  < player1Position.y + heightPaddleScale2 ) 
      {
        setBallDirection(({x: -1, y: Math.random() * 2.5}));
      }
      else
      {
        setBallDirection(({x: -1, y: Math.random() * 0.5}));
      }
      setBallSpeed(BALL_SPEED);
      playPaddle2Sound();
      if (player2ActivateBonus)
      {
        setBallPower(true);
        if (whichSpellPlayer2?.name == "Super strike")
          power_superstrike(2);
        else if (whichSpellPlayer2?.name == "Swing")
          power_swing(2);
        
        setplayer2ActivateBonus(false);
        setWhichSpellPlayer2(null);
      }
    }
    else if (wall && ballDirection.x < 0 && ballPosition.x - BALL_RADIUS <= WALL_PLAYER1 + WALL_WIDTH / 2 && ballPosition.x - BALL_RADIUS >= WALL_PLAYER1 - WALL_WIDTH / 2)
    {
      playWallSound();
      setBallDirection((prev) => ({x: -prev.x, y: prev.y}));
    }
    else if (wall2 && ballDirection.x > 0 && ballPosition.x + BALL_RADIUS >= WALL_PLAYER2 - WALL_WIDTH / 2 && ballPosition.x + BALL_RADIUS <= WALL_PLAYER2 + WALL_WIDTH / 2)
    {
      playWallSound();
      setBallDirection((prev) => ({x: -prev.x, y: prev.y}));
    }
    else
    {
      setBallPosition((prev) => ({x: prev.x + ballDirection.x * ballSpeed, y: prev.y + ballDirection.y * ballSpeed,}));
    }
  }

  function hitBonus() {
    const distance = Math.sqrt(Math.pow((ballPosition.x - bonusPosition.x), 2) + Math.pow((ballPosition.y - bonusPosition.y), 2));
    const distance2 = Math.sqrt(Math.pow((ballPosition.x - bonusPosition2.x), 2) + Math.pow((ballPosition.y - bonusPosition2.y), 2));

    if (ballDirection.x > 0)
    {
      if (distance + BALL_RADIUS + STROKE <= BONUS_WIDTH / 2 + BONUS_HEIGHT / 2)
      {
        setShowBonus(false);
        setplayer1GetBonus(true);
        setWhichSpellPlayer1(Object.assign({}, selectedSpell));
        setBonusPosition({x: (BOARD_WIDTH * 0.25), y: -BONUS_HEIGHT})
        setSelectedSpell(spells[Math.floor(Math.random() * 4)]);
        setTimeLeft(TIME_LEFT);
        playBonusSound();
      }
      if (distance2 + BALL_RADIUS + STROKE <= BONUS_WIDTH / 2 + BONUS_HEIGHT / 2)
      {
        setShowBonus2(false);
        setplayer1GetBonus(true);
        setWhichSpellPlayer1(Object.assign({}, selectedSpell2));
        setBonusPosition2({x: (BOARD_WIDTH * 0.75), y: -BONUS_HEIGHT})
        setSelectedSpell2(spells[Math.floor(Math.random() * 4)]);
        setTimeLeft2(TIME_LEFT);
        playBonusSound();
      }
    }
    else if (ballDirection.x < 0)
    {
      if (distance + BALL_RADIUS + STROKE <= BONUS_WIDTH / 2 + BONUS_HEIGHT / 2)
      {
        setShowBonus(false);
        setplayer2GetBonus(true);
        setWhichSpellPlayer2(Object.assign({}, selectedSpell));
        setBonusPosition({x: (BOARD_WIDTH * 0.25), y: -BONUS_HEIGHT})
        setSelectedSpell(spells[Math.floor(Math.random() * 4)]);
        setTimeLeft(TIME_LEFT);
        playBonusSound();
      }
      if (distance2 + BALL_RADIUS + STROKE <= BONUS_WIDTH / 2 + BONUS_HEIGHT / 2)
      {
        setShowBonus2(false);
        setplayer2GetBonus(true);
        setWhichSpellPlayer2(Object.assign({}, selectedSpell2));
        setBonusPosition2({x: (BOARD_WIDTH * 0.75), y: -BONUS_HEIGHT})
        setSelectedSpell2(spells[Math.floor(Math.random() * 4)]);
        setTimeLeft2(TIME_LEFT);
        playBonusSound();
      }
    }
  }

  function animateBonus() {
    if (showBonus)
    {
      if (bonusPosition.y <= BOARD_HEIGHT)
        setBonusPosition((prev) => ({x: prev.x, y: prev.y + (BONUS_SPEED) + Math.random() * 2}));
      else
      {
        setBonusPosition({x: (BOARD_WIDTH * 0.25), y: -BONUS_HEIGHT})
        setShowBonus(false);
        setTimeLeft(TIME_LEFT);
      }
    }
    if (showBonus2)
    {
      if (bonusPosition2.y <= BOARD_HEIGHT)
        setBonusPosition2((prev) => ({x: prev.x, y: prev.y + (BONUS_SPEED) + Math.random() * 2}))
      else
      {
        setBonusPosition2({x: (BOARD_WIDTH * 0.75), y: -BONUS_HEIGHT})
        setShowBonus2(false);
        setTimeLeft2(TIME_LEFT);
      }
    }
  }

  function checkEndGame() {
    if (player1Score >= SCORE_LIMIT || player2Score >= SCORE_LIMIT) 
    {
      setShowBonus(false);
      setShowBonus2(false);
      setplayer1GetBonus(false);
      setplayer2GetBonus(false);
      setIsPlaying(false);
      setEndGame(true);
      setTimeout(() => {
        navigate("/game");
      }, 5000)
    }
  }

  useEffect(() => {

    const animate = () => {
      
      if (endGame)
        return;

      checkEndGame();
        
      if (!isPlaying)
        return;
      
      hitBonus();
      hitScenery();
      animateBonus();
      
    };
      window.requestAnimationFrame(animate);
  }, [ballDirection, ballPosition, isPlaying, bonusPosition, bonusPosition2, showBonus, showBonus2, endGame]);

  function power_superstrike(player: number)
  {
    if (player == 1 && whichSpellPlayer1)
    {
      setBallDirection({x: 1, y: 0});
      setBallSpeed(BALL_SPEED * whichSpellPlayer1?.speed);
      setBallPower(true);
    }
    else if (player == 2 && whichSpellPlayer2)
    {
      setBallDirection({x: -1, y: 0});
      setBallSpeed(BALL_SPEED * whichSpellPlayer2?.speed);
      setBallPower(true);
    }
      
  }
  
  function power_swing(player: number)
  {
    if (player == 1 && whichSpellPlayer1)
    {
      setBallDirection({x: 0.2, y: 0.95});
      setBallSpeed(BALL_SPEED * whichSpellPlayer1?.speed);
      setBallPower(true);
    }
    else if (player == 2 && whichSpellPlayer2)
    {
      setBallDirection({x: -0.2, y: 0.95});
      setBallSpeed(BALL_SPEED * whichSpellPlayer2?.speed);
      setBallPower(true);
    }
  }
  
  function power_mindcontrol(player: number)
  {
    if (player == 1)
    {
      setTimeLeftMindControl(5);
      setHeightPaddleScale2(PADDLE_HEIGHT / 2);
    }
    if (player == 2)
    {
      setTimeLeftMindControl2(5);
      setHeightPaddleScale(PADDLE_HEIGHT / 2);
    }
  }

  function power_thewall(player: number)
  {
    if (player == 1)
    {
      setTimeLeftWall(5);
    }
    if (player == 2)
    {
      setTimeLeftWall2(5);
    }
  }

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const windowHeight = window.innerHeight;
      setMousePos({ x: event.clientX, y: event.clientY});
      if ((mousePos.y * BOARD_HEIGHT) / windowHeight + heightPaddleScale < BOARD_HEIGHT)
        setPlayer1Position((prev) => ({x: prev.x, y: (mousePos.y * BOARD_HEIGHT) / windowHeight }));
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => 
    {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [mousePos, player1Position])

  useEffect(() => {
    const handleMouseClick = (event: MouseEvent) => {
      if (event && player1GetBonus)
      {
        playLaunchSound();
        setplayer1ActivateBonus(true);
        setplayer1GetBonus(false);
        if (whichSpellPlayer1?.name == "Mind control")
        {
          power_mindcontrol(1);
          setWhichSpellPlayer1(null);
          setplayer1ActivateBonus(false);
        }
        else if (whichSpellPlayer1?.name == "The wall")
        {
          power_thewall(1);
          setWhichSpellPlayer1(null);
          setplayer1ActivateBonus(false);
        }
      }
    };

    window.addEventListener('click', handleMouseClick);

    return () => 
    {
      window.removeEventListener('click', handleMouseClick);
    };
  }, [player1ActivateBonus, player1GetBonus, whichSpellPlayer1])



  useEffect(() => 
  {
    const handleKeyDown = (event: KeyboardEvent) => 
    {
      switch (event.key)
      {
        case ' ':
          event.preventDefault();
          setIsReady(true);
          setTimeout(() => {
            setIsPlaying(true);
          }, TIME_LAUNCH_BALL * 1000);
          break;
        default:
          break;
      };
    }
    
    window.addEventListener('keydown', handleKeyDown);

    return () => {window.removeEventListener('keydown', handleKeyDown);};
  }, [isPlaying]);


  useEffect(() => {
    const timer = setInterval(() => {
      if (timeLeft > 0) {
        setTimeLeft(timeLeft - 1);
      }
    }, 1000);

    if (timeLeft === 0) 
    {
      setShowBonus(true);
      setTimeLeft(-1);
    }

    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    const timer2 = setInterval(() => {
      if (timeLeft2 > 0) {
        setTimeLeft2(timeLeft2 - 1);
      }
    }, 1000);

    if (timeLeft2 === 0) 
    {
      setShowBonus2(true);
      setTimeLeft2(-1);
    }

    return () => clearInterval(timer2);
  }, [timeLeft2]);

  useEffect(() => {
    const timer_mindcontrol = setInterval(() => {
      if (timeLeftMindControl > 0) {
        setTimeLeftMindControl(timeLeftMindControl - 1);
        setHeightPaddle2(true);
      }
    }, 1000);

    if (timeLeftMindControl === 0) 
    {
      setHeightPaddle2(false);
      setHeightPaddleScale2(PADDLE_HEIGHT);
      setWhichSpellPlayer1(null);
      setTimeLeftMindControl(-1);
    }

    return () => clearInterval(timer_mindcontrol);
  }, [timeLeftMindControl, heightPaddle]);

  useEffect(() => {
    const timer_mindcontrol2 = setInterval(() => {
      if (timeLeftMindControl2 > 0) {
        setTimeLeftMindControl2(timeLeftMindControl2 - 1);
        setHeightPaddle(true);
      }
    }, 1000);

    if (timeLeftMindControl2 === 0) 
    {
      setHeightPaddle(false);
      setHeightPaddleScale(PADDLE_HEIGHT);
      setWhichSpellPlayer2(null);
      setTimeLeftMindControl2(-1);
    }

    return () => clearInterval(timer_mindcontrol2);
  }, [timeLeftMindControl2, heightPaddle2]);

  useEffect(() => {
    const timer_wall = setInterval(() => {
      if (timeLeftWall > 0) {
        setTimeLeftWall(timeLeftWall - 1);
        setWall(true);
      }
    }, 1000);

    if (timeLeftWall === 0) 
    {
      setWall(false);
      setTimeLeftWall(-1);
    }

    return () => clearInterval(timer_wall);
  }, [timeLeftWall, wall]);

  useEffect(() => {
    const timer_wall2 = setInterval(() => {
      if (timeLeftWall2 > 0) {
        setTimeLeftWall2(timeLeftWall2 - 1);
        setWall2(true);
      }
    }, 1000);

    if (timeLeftWall2 === 0) 
    {
      setWall2(false);
      setTimeLeftWall2(-1);
    }

    return () => clearInterval(timer_wall2);
  }, [timeLeftWall2, wall2]);

  useEffect(() => {
    const IA = () => {
      if (isPlaying)
      {
        if (ballDirection.x > 0)
        {
          if (ballDirection.y > 0)
          {
            if (ballPosition.y > player2Position.y + PADDLE_HEIGHT) 
            {
              setPlayer2Position((prev) => ({x: prev.x, y: prev.y + IA_SPEED }));
            }
            else if (ballPosition.y > player2Position.y + (PADDLE_HEIGHT / 4) * 3)
            {
              setPlayer2Position((prev) => ({x: prev.x, y: prev.y + IA_SPEED * 0.8}));
            }
            else if (ballPosition.y > player2Position.y + PADDLE_HEIGHT / 2)
            {
              setPlayer2Position((prev) => ({x: prev.x, y: prev.y + IA_SPEED * 0.6}));
            }
          }
          else if (ballDirection.y < 0)
          {
            if (ballPosition.y < player2Position.y)
            {
              setPlayer2Position((prev) => ({x: prev.x, y: prev.y - IA_SPEED }));
            }
            else if (ballPosition.y < player2Position.y + PADDLE_HEIGHT / 4)
            {
              setPlayer2Position((prev) => ({x: prev.x, y: prev.y - IA_SPEED * 0.8}));
            }
            if (ballPosition.y < player2Position.y + PADDLE_HEIGHT / 2)
            {
              setPlayer2Position((prev) => ({x: prev.x, y: prev.y - IA_SPEED * 0.6}));
            }
          }
          else if (ballDirection.y == 0)
          {
            if (ballPosition.y > player2Position.y)
              setPlayer2Position((prev) => ({x: prev.x, y: prev.y + IA_SPEED }));
            else if (ballPosition.y < player2Position.y)
              setPlayer2Position((prev) => ({x: prev.x, y: prev.y - IA_SPEED }));
          }
        }
        else if (ballDirection.x < 0)
        {
          if ( player2Position.y + PADDLE_HEIGHT / 2  > BOARD_HEIGHT / 2 ) 
          {
            setPlayer2Position((prev) => ({x: prev.x, y: prev.y - 2}));
          } 
          else if ( player2Position.y + PADDLE_HEIGHT / 2 < BOARD_HEIGHT / 2 ) 
          {
            setPlayer2Position((prev) => ({x: prev.x, y: prev.y + 2}));
          }
        }
      }
    }

    if (player2GetBonus)
    {
      playLaunchSound();
      setplayer2ActivateBonus(true);
      if (whichSpellPlayer2?.name == "Mind control")
      {
        power_mindcontrol(2);
        setplayer2ActivateBonus(false);
        setWhichSpellPlayer2(null);
      }
      else if (whichSpellPlayer2?.name == "The wall")
      {
        power_thewall(2);
        setplayer2ActivateBonus(false);
        setWhichSpellPlayer2(null);
      }
      setplayer2GetBonus(false);
    }

    window.requestAnimationFrame(IA);
  }, [player2Position, ballPosition])

    return (
    <svg className='gameboard' viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`} style={{ border: '1px solid black' }}>
      <Board ballState={isPlaying}
            winLose={endGame}
            sideWin={player1Score > player2Score ? 'You won' : 'You lost'}
            isReady={isReady} 
            ballPosition={ballPosition}
            player1Position={player1Position}
            player2Position={player2Position}
            player1Score={player1Score} 
            player2Score={player2Score}
            showBonus={showBonus}
            showBonus2={showBonus2}
            bonusPosition={bonusPosition}
            bonusPosition2={bonusPosition2}
            ballPower={ballPower}
            wall={wall}
            wall2={wall2}
            blocSpell={selectedSpell}
            blocSpell2={selectedSpell2}
            spell={whichSpellPlayer1}
            spell2={whichSpellPlayer2}
            height_paddle1={heightPaddleScale}
            height_paddle2={heightPaddleScale2}
            />
    </svg>
  );
};

