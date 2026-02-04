import React from 'react';
import { getSession } from '../../../../../../utils/user.server';
import ProfilePage from '../../../../../../components/userapp/profile/ProfilePage';

export default async function page() {
    let session = await getSession();

    if (!session) {
        redirect('/app/auth/login');
    }

    return (
        <div>
            <ProfilePage profile={session} />
        </div>
    );
}
