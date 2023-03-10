import { Routes, Route } from "react-router-dom";
import Layout from './routes/layout';
import Home from './routes/home';
import Game from './routes/game';
import Chat from './routes/chat';
import NoMatch from './routes/404';
import Setting from './routes/setting';

import './index.css';
import LogPage from "./LogPage/LogPage";
import CallBackPage from "./CallBackPage/CallBackPage";

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
