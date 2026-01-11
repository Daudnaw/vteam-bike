import React from 'react';
import { getSession } from '../../../../../../utils/user.server';
import ProfilePage from '../../../../../../components/userapp/profile/ProfilePage';

const sampleUser = {
    id: 1,
    firstName: 'Test',
    lastName: 'Testsson',
    email: 'test@test.se',
};

export default async function page() {
    let session = await getSession();

    if (!session) {
        redirect('/app/auth/login');
    }

    return (
        <div>
            <ProfilePage profile={sampleUser} />
        </div>
    );
}
