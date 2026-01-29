import React from 'react';
import StatCard from '../../../../../../components/webb/dashboards/shared/StatCard';
import ServiceBikes from '../../../../../../components/webb/dashboards/admin/bikes/ServiceBikes';

export default function Page() {
    return (
        <div className='p-5'>
            <h2 className='text-h3 mt-10 font-bold mb-5'>Service</h2>
            <div className='grid grid-cols-3 gap-5'>
                <StatCard nr={0} text='At Service' />
                <StatCard nr={0} text='Serviced' />
            </div>
            <div className='mb-5'></div>
            <ServiceBikes />
        </div>
    );
}
