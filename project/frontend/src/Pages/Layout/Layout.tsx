import { Link, Outlet } from 'react-router-dom';
import NavBar from '../../Component/NavBar/NavBar';

import './Layout.css';
import './stars.scss'

interface LayoutProps {
    handleTheme: () => void;
}

const Ball = () => {
    return (
      <circle
        cx={50}
        cy={50}
        r={5}
        fill="grey"
        stroke="white"
        strokeWidth="2"
      />
    );
  };

  const Title = () => {
    return (
      <text
        x={200}
        y={100}
        fill="white"
        fontSize="50"
        fontFamily="Lobster"
        fontStyle="italic"
        fontWeight="bold"
      >
        TRANSCENDANCE
      </text>
    );
  };

const Background = ({
  }: {
  }) => {
    return (
      <svg width={2000} height={150} viewBox={`0 0 ${2000} ${150}`}>
        {/* <Ball /> */}
        <Title />
      </svg>
    );
  };

export default function Layout({handleTheme}: LayoutProps) {
    return (
        <div className='layout'>
            <div className='header' id='backgroudstars'>
            <Link to={`/`}>
              <Background />
              <div id="stars"></div>
				      <div id="stars2"></div>
				      <div id="stars3"></div>
            </Link>
            </div>
            <div className='content'>
                <div className='maincontent'>
                    <Outlet />
                </div>
                <div className='navcontent'>
                    <NavBar handleTheme={handleTheme}/>
                </div>
            </div>
        </div>
    );
}
