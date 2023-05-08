import './NavHome.scss';

export default function NavHome() {
	return (
		<div className="NavHome" id="NavHome">
			<div className="toggle">
				<i className="fa fa-bars"></i> Menu
			</div>
			<div className="Selector">
				<div className="selectItem">
					<a href="#profile">
						<i className="fa fa-user"></i> Profile
					</a>
				</div>
				<div className="selectItem">
					<a href="#friend">
						<i className="fa fa-users"></i> Friend
					</a>
				</div>
				<div className="selectItem">
					<a href="#leaderBoard">
						<i className="fa fa-earth-americas"></i> LeaderBoard
					</a>
				</div>
			</div>
		</div>
	);
}
