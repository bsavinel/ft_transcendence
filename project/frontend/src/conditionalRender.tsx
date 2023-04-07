import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import ApiClient, { getAccess } from './utils/ApiClient';
import LoginPage from './Pages/LoginPage/LoginPage';

interface CheckLog {
	isLogged: boolean;
	isLoading: boolean;
}

async function initialFetch(
	checkLog: CheckLog,
	setCheckLog: React.Dispatch<React.SetStateAction<CheckLog>>
) {
	console.log('debut');
	try {
		await ApiClient.get('/user/me');
	} catch {}
	console.log('fin');
	if (getAccess() && checkLog.isLoading)
		setCheckLog({ isLogged: true, isLoading: false });
	else if (checkLog.isLoading)
		setCheckLog({ isLogged: false, isLoading: false });
}

export default function LogGuard() {
	const [checkLog, setCheckLog] = useState<CheckLog>({
		isLogged: false,
		isLoading: true,
	});

	initialFetch(checkLog, setCheckLog);

	//TODO mettre une vrai page de login
	console.log(checkLog);
	if (checkLog.isLoading) return <div>loading</div>; 
	else if (checkLog.isLogged) return <Outlet />;
	else return <LoginPage />;
}
