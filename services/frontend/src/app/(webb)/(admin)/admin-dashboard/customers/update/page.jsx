'use client';

import { useSearchParams } from 'next/navigation';
import UpdateUser from '../../../../../../../components/webb/dashboards/admin/user/forms/UpdateUser';

export default function Page() {
    const searchParams = useSearchParams();
    const userId = searchParams.get('userId');

    if (!userId)
        return <p className='text-center text-red-500'>User ID is missing</p>;

    return (
        <div className='p-5 flex justify-center h-screen items-center'>
            <UpdateUser userId={userId} />
        </div>
    );
}
