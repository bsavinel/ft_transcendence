import { Link, Outlet } from 'react-router-dom';
import NavBar from '../../Component/NavBar/NavBar';

import './Layout.css';

export default function Layout() {
    return (
        <div className='layout'>
            <Link to={`/`} className='header'><h1>HEADER</h1></Link>
            <div className='content'>
                <div className='maincontent'>
                    <Outlet />
                </div>
                <div className='navcontent'>
                    <NavBar />
                </div>
            </div>
        </div>
    );
}
