'use client';

import React from 'react';
import UsersList from '../../../../../../components/webb/dashboards/admin/user/AllUser';

export default function MyPage() {
    return (
        <div className='p-5'>
            <h2 className='my-5 text-h2 font-bold'>Alla konton</h2>
            <UsersList />
        </div>
    );
}
