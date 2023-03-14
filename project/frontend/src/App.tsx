import { Routes, Route } from "react-router-dom";
import Layout from './Pages/Layout/Layout';
import Home from './Pages/Home/Home';
import Game from './Pages/Game/Game';
import Chat from './Pages/Chat/Chat';
import NoMatch from './Pages/404';
import Setting from './Pages/Setting/Setting';
import LogPage from "./Pages/LogPage/LogPage";
import CallBackPage from "./Pages/CallBackPage/CallBackPage";
import './index.css';

export default function App() {
    return (
        <div className='app'>
                <Routes>
                    <Route path="/login" element={<LogPage />}/>
                    <Route path="/callback" element={<CallBackPage />}/>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Home />} />
                        <Route path="game/*" element={<Game />} />
                        <Route path="chat" element={<Chat />} />
                        <Route path="setting" element={<Setting />} />
                        <Route path="*" element={<NoMatch />} />
                    </Route>
                </Routes>
        </div>
    );
};
