import React from 'react';
import StatCard from '../../../../../../components/webb/dashboards/shared/StatCard';
import AllBikes from '../../../../../../components/webb/dashboards/admin/bikes/AllBikes';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { getBikes } from '../../../../actions/bikes';

export default async function Page() {
    const bikes = await getBikes();

    const totalBikes = bikes.length;
    const totalOffline = bikes.filter(
        (bike) => bike.status == 'offline'
    ).length;
    const totalDriving = bikes.filter(
        (bike) => bike.status == 'driving'
    ).length;

    return (
        <div className='p-5'>
            <h2 className='text-h2 mb-5 font-bold'>Översikt Cyklar</h2>
            <div className='grid grid-cols-3 gap-5'>
                <StatCard nr={totalBikes} text='Antal cyklar' />
                <StatCard nr={totalOffline} text='Cyklar offline' />
                <StatCard nr={totalDriving} text='Aktiva cyklar' />
            </div>

            <div className='flex items-center justify-between mt-10 mb-5'>
                <h2 className='text-h3  font-bold'>Alla Cyklar</h2>
                <div className='flex justify-between items-center '>
                    <Link
                        href='/admin-dashboard/bikes/create'
                        className='flex items-center gap-2 bg-detail-yellow text-black px-4 py-2 rounded hover:bg-yellow-600 transition'
                    >
                        <Plus size={18} />
                        Add Bike
                    </Link>
                </div>
            </div>

            <AllBikes />
        </div>
    );
}
