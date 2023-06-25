import { useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import ProfilePart from '../Home/profilePart/ProfilePart';
import NoMatch from '../404';

function useQuery() {
	const { search } = useLocation();

	return useMemo(() => new URLSearchParams(search), [search]);
}

function isnumber(str: string) {
	for (let i = 0; i < str.length; i++) {
		if (str[i] < '0' || str[i] > '9') return false;
	}
	return true;
}

export default function Profile() {
	let {userId} = useParams();
	if (userId === undefined || userId === null || !isnumber(userId))
		return <NoMatch />;
	return <ProfilePart userId={+userId} />;
}
