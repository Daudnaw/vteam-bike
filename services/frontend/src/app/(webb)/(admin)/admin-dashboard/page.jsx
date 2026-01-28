import React from 'react';
import StatCard from '../../../../../components/webb/dashboards/shared/StatCard';
import NetVolumeCard from '../../../../../components/payments/Statistics';
import LinkCard from '../../../../../components/webb/dashboards/admin/LinkCard';

export default function AdminDashboard() {
    return (
        <div className='p-5'>
            <h2 className='text-h2 mb-5 font-bold'>Översikt</h2>
            <div className='grid grid-cols-3 gap-5'>
                <StatCard nr={0} text='Cyklar' />
                <StatCard nr={0} text='Användare' />
                <StatCard nr={0} text='Städer' />
            </div>
            <div className='mt-5'>
                <NetVolumeCard />
            </div>

            <h2 className='text-h3 mt-10'>Snabblänkar</h2>

            <div className='grid grid-cols-5 gap-5 mt-5'>
                <LinkCard to='/admin-dashboard/customers' text='Användare' />
                <LinkCard to='/admin-dashboard/cities' text='Städer' />
                <LinkCard to='/admin-dashboard/map' text='Karta' />
                <LinkCard to='/admin-dashboard/bikes' text='Cyklar' />
                <LinkCard to='/admin-dashboard/zones' text='Zoner' />
                <LinkCard to='/admin-dashboard/payments' text='Payments' />
                <LinkCard to='/admin-dashboard/service' text='Service' />
            </div>
        </div>
    );
}
