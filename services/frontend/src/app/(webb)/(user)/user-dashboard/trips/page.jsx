import React from 'react';
import TripTable from '../../../../../../components/webb/dashboards/shared/TripTable';
import StatCard from '../../../../../../components/webb/dashboards/shared/StatCard';

export default function Page() {
    return (
        <div className='p-5'>
            <h2 className='text-h2 mb-5 font-bold'>Översikt Resor</h2>
            <div className='grid grid-cols-3 gap-5'>
                <StatCard nr={0} text='Resor' />
                <StatCard nr={0} text='Kilometer körda' />
                <StatCard nr={0} text='Antal minuter kört' />
            </div>

            <h2 className='text-h3 mt-10 font-bold mb-5'>Alla Resor</h2>
            <TripTable />
        </div>
    );
}
