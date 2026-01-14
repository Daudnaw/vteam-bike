'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import UpdateForm from '../../../../../../../components/webb/dashboards/admin/zone/form/UpdateForm';
import UpdateCity from '../../../../../../../components/webb/dashboards/admin/zone/form/UpdateCity';

export default function UpdateZonePage() {
    const searchParams = useSearchParams();
    const zoneId = searchParams.get('zoneId');
    const cityId = searchParams.get('cityId');

    if (cityId) {
        return (
            <div className='h-screen p-5 flex justify-center items-center'>
                <UpdateCity cityId={cityId} />
            </div>
        );
    }

    if (zoneId) {
        return (
            <div className='h-screen p-5 flex justify-center items-center'>
                <UpdateForm zoneId={zoneId} />
            </div>
        );
    }
}
