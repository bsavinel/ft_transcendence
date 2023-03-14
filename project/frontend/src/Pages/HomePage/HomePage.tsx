import Button from '@mui/material/Button';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';

function SignInButton()
{
	const handlerClick = () => 
	{
		console.log("signIn");
	}

	return <Button variant="contained" size="large" startIcon={<RocketLaunchIcon/>} onClick={handlerClick} >Sign In</Button> 
}

export default function HomePage() {
	return (
		<div className='app'>
			<h1>First Page</h1>
			<SignInButton />
		</div>
	);
}
