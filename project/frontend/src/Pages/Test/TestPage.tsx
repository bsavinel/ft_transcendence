import ProfilePart from './profilePart/ProfilePart';
import FriendPart from './friendPart/FriendPart';
import NavHome from './navHome/NavHome';
import './TestPage.scss';
import LeaderPart from './LeaderPart/LeaderPart';

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
