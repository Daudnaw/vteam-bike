import React from 'react';
import StatCard from '../../../../../components/webb/dashboards/shared/StatCard';
import NetVolumeCard from '../../../../../components/payments/Statistics';

export default function AdminDashboard() {
    return (
        <div className='p-5'>
            <h2 className='text-h2 mb-5'>Översikt</h2>
            <div className='grid grid-cols-3 gap-5'>
                <StatCard nr={0} text='Bikes' />
                <StatCard nr={0} text='Customers' />
                <StatCard nr={0} text='Cities' />
                <NetVolumeCard />
            </div>

            <h2 className='text-h3 mt-10'>vetinte</h2>
            <h3 className='text-center text-h1 mt-10'>vad vill man ha här</h3>
        </div>
    );
}
