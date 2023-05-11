import ProfilePart from '../Home/profilePart/ProfilePart';
import FriendPart from '../Home/friendPart/FriendPart';
import NavHome from '../Home/navHome/NavHome';
import './TestPage.scss';
import LeaderPart from '../Home/LeaderPart/LeaderPart';

export default function TestPage() {
	return (
		<div className="HomePage">
			<NavHome />
			<div className="HomeContent" id="HomeContent">

			</div>
		</div>
	);
}
