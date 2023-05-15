import ProfilePart from './profilePart/ProfilePart';
import FriendPart from './friendPart/FriendPart';
import NavHome from './navHome/NavHome';
import LeaderPart from './LeaderPart/LeaderPart';
import { getAccessContent } from '../../utils/ApiClient';

import './Home.scss';

export default function Home() {
	return ( <ProfilePart userId={getAccessContent()!.userId}/>
	);
}
