import React from 'react';
import CustomerProfile from '../../../../../../components/webb/dashboards/customer/CustomerProfile';
import { getSession } from '../../../../../../utils/user';

export default async function Page() {
    const session = await getSession();

    return (
        <div className='p-5'>
            <h2 className='text-h2 mb-5 font-bold'>Profil</h2>

            <CustomerProfile
                firstName='Test'
                lastName='Testsson'
                email={session.email}
                verified={false}
            />
        </div>
    );
}
