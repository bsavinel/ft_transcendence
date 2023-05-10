import { useEffect, useState } from 'react';
import ApiClient, { getAccessContent } from '../../../utils/ApiClient';

import './FriendPart.scss';

interface Profile {
	id: number;
	username: string;
	avatarUrl: string;
	level: number;
	percent: number;
}

async function getAllFriend() {
	try {
		let response = await ApiClient.get(
			`/users/${getAccessContent()?.userId}/friends`
		);
		let usersStat = response.data;
		return usersStat.map((user: any) => ({
			...user,
			userId: user.id,
			id: undefined,
		}));
	} catch (e) {
		return null;
	}
}

function RowProfileFriend({ profile }: { profile: Profile }) {
	return (
		<div className="FriendBox">
			<img className="avatarFriend" src={profile.avatarUrl} />
			<div className="pseudo">
				<p className="username">{profile.username}</p>
				<p className="personalId">#{profile.id}</p>
			</div>
			<div className="levelBox">
				<div className="levelNumber">
					Level {Math.floor(profile.level)}
				</div>
				<div className="progress">
					<div
						className="progress-bar"
						style={{
							width: `${Math.floor(
								(profile.level - Math.floor(profile.level)) *
									100
							)}%`,
						}}
					>
						{profile.percent}%
					</div>
				</div>
			</div>
		</div>
	);
}

export default function FriendPart() {
	const [amis, setAmis] = useState<Profile[]>([]);

	useEffect(() => {
		(async () => {
			let tmp = await getAllFriend();
			console.log(amis);
			setAmis(tmp);
		})();
	}, []);

	return (
		<div className="FriendPart" id="friend">
			<div className="FriendScroll">
				<div className="FriendHeader">Friends :</div>
				<div className="FriendList">
					{!amis ? (
						<div className="noFriend">No friend</div>
					) : (
						amis.map((a, id) => (
							<RowProfileFriend key={id} profile={a} />
						))
					)}
				</div>
			</div>
		</div>
	);
}
