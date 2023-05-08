import ProfilePart from './profilePart/ProfilePart';
import FriendPart from './friendPart/FriendPart';
import NavHome from './navHome/NavHome';
import LeaderPart from './LeaderPart/LeaderPart';

import './Home.scss';

export default function TestPage() {
	return (
		<div className="HomePage">
			<NavHome />
			<div className="HomeContent" id="HomeContent">
				<ProfilePart />
				<FriendPart />
				<LeaderPart />
			</div>
		</div>
	);
}
