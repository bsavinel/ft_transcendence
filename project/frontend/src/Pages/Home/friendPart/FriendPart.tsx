import ChatIcon from '@mui/icons-material/Chat';
import { IconButton } from '@mui/material';

import './FriendPart.scss';

interface Profile {
	id: number;
	username: string;
	avatarUrl: string;
	level: number;
	percent: number;
}

function ProfileGenerator(num: number): Profile[] {
	var profile: Profile[] = [];
	for (var i = 0; i < num; i++) {
		var profile1: Profile = {
			id: i,
			username: 'test' + i.toString(),
			avatarUrl:
				'https://cdn.intra.42.fr/users/fbdd1b21de009c605831e5f3cdeba836/bsavinel.jpg',
			level: Math.floor(Math.random() * 10),
			percent: Math.floor(Math.random() * 100),
		};
		profile.push(profile1);
	}
	return profile;
}

var amis = ProfileGenerator(35);

function RowProfileFriend({ profile }: { profile: Profile }) {
	return (
		<div className="FriendBox">
			<img className="avatarFriend" src={profile.avatarUrl} />
			<div className="pseudo">
				<p className="username">{profile.username}</p>
				<p className="personalId">#{profile.id}</p>
			</div>
			<div className="levelBox">
				<div className="levelNumber">Level {profile.level}</div>
				<div className="progress">
					<div
						className="progress-bar"
						style={{ width: `${profile.percent}%` }}
					>
						{profile.percent}%
					</div>
				</div>
			</div>
		</div>
	);
}

export default function FriendPart() {
	return (
		<div className="FriendPart" id="friend">
			<div className="FriendScroll">
				<div className="FriendHeader">Friends :</div>
				<div className="FriendList">
					{amis.map((a) => (
						<RowProfileFriend profile={a} />
					))}
				</div>
			</div>
		</div>
	);
}
