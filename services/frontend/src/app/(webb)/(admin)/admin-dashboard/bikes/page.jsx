import React from 'react';
import StatCard from '../../../../../../components/webb/dashboards/shared/StatCard';
import AllBikes from '../../../../../../components/webb/dashboards/admin/bikes/AllBikes';

export default function Page() {
    return (
        <div className='p-5'>
            <h2 className='text-h2 mb-5 font-bold'>Översikt Bikes</h2>
            <div className='grid grid-cols-3 gap-5'>
                <StatCard nr={0} text='Available' />
                <StatCard nr={0} text='' />
                <StatCard nr={0} text='At service' />
            </div>

            <h2 className='text-h3 mt-10 font-bold mb-5'>Alla Bikes</h2>
            <AllBikes />
        </div>
    );
}
