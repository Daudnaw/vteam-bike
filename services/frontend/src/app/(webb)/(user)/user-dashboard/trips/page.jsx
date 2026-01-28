import React from 'react';
import TripTable from '../../../../../../components/webb/dashboards/shared/TripTable';
import StatCard from '../../../../../../components/webb/dashboards/shared/StatCard';
import { getAllRentalUser } from '../../../../actions/rental';
import { getSession } from '../../../../../../utils/user.server';

export default async function Page() {
    let session = await getSession();

    const rentals = await getAllRentalUser(session._id);

    const nrOfRentals = rentals.length;
    let totalCost = 0;

    for (const item of rentals) {
        totalCost += item.cost;
    }

    return (
        <div className='p-5'>
            <h2 className='text-h2 mb-5 font-bold'>Översikt Resor</h2>
            <div className='grid grid-cols-3 gap-5'>
                <StatCard nr={nrOfRentals} text='Resor' />
                <StatCard nr={totalCost} text='Total kostnad' />
            </div>

            <h2 className='text-h3 mt-10 font-bold mb-5'>Alla Resor</h2>
            <TripTable rentals={rentals} />
        </div>
    );
}
