import React from 'react';
import { getSession } from '../../../../../../utils/user.server';
import ProfilePage from '../../../../../../components/userapp/profile/ProfilePage';
import { getSingleUser } from '../../../../actions/user';

export async function getProfile(id) {
    const profile = await getSingleUser(id);

    return profile;
}
export default async function page() {
    let session = await getSession();

    if (!session) {
        redirect('/app/auth/login');
    }

    const profile = await getProfile(session.sub);

    if (!profile) {
        return 'No profile found';
    }

    return (
        <div>
            <ProfilePage profile={profile} />
        </div>
    );
}
