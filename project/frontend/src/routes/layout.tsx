import { Link, Outlet } from 'react-router-dom';
import './css/layout.css';

export default function Layout() {
    return (
        <div className='layout'>
            <Link to={`/`} className='header'><h1>HEADER</h1></Link>
            <div className='content'>
                <div className='sidecontent'>
                    <h1>SIDE MENU</h1>
                </div>
                <div className='maincontent'>
                    <Outlet />
                </div>
                <div className='navcontent'>
                    <h1>NAVBAR</h1>
                </div>
            </div>
        </div>
    );
}
