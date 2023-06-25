import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function BrutForce() {
	const [value, setValue] = useState({
		id42: 0,
		username: '',
		avatarUrl: '',
	});

	const handleSubmit = () => {
		try {
			axios.post(`${import.meta.env.VITE_BACK_URL}/oauth/force`, value, {
				withCredentials: true,
			});
		} catch (e) {
			console.log('une erreur lors du brutforce est arrive');
		}
		console.log('brutforce done');
	};

	return (
		<>
			<div>Coucou, tu as pas a etre sur cette tu peut partir stp</div>
			<div>
				Si tu continue de lire ca c'est que tu est pas pati donc
				attention je risque de m'enerver
			</div>
			<br />
			<label>
				id42:
				<input
					type="number"
					value={value.id42}
					onChange={(e) => {
						setValue({ ...value, id42: +e.target.value });
					}}
				/>
			</label>
			<br />
			<label>
				username:
				<input
					type="text"
					value={value.username}
					onChange={(e) => {
						setValue({ ...value, username: e.target.value });
					}}
				/>
			</label>
			<br />
			<label>
				avatarUrl:
				<input
					type="text"
					value={value.avatarUrl}
					onChange={(e) => {
						setValue({ ...value, avatarUrl: e.target.value });
					}}
				/>
			</label>
			<br />
			<button onClick={handleSubmit}>Submit</button>
			<br />
			<Link to={`/`} style={{ backgroundColor: 'green' }}>
				<h1>Go to home</h1>
			</Link>
		</>
	);
}
