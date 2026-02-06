import React from 'react';
import StatCard from '../../../../../components/webb/dashboards/shared/StatCard';
import TripTable from '../../../../../components/webb/dashboards/shared/TripTable';
import { getAllRentalUser } from '../../../actions/rental';
import { getSession } from '../../../../../utils/user.server';

export default async function UserDashboard() {
    let session = await getSession();

    const rentals = await getAllRentalUser(session._id);
    let totalCost = 0;
    for (const item of rentals) {
        totalCost += item.cost;
    }
    const nrOfRentals = rentals.length;
    return (
        <div className='p-5'>
            <h2 className='text-h2 mb-5 font-bold'>Översikt</h2>
            <div className='grid grid-cols-3 gap-5'>
                <StatCard nr={nrOfRentals} text='Resor' />
                <StatCard nr={totalCost} text='Kr rest för' />
            </div>

            <h2 className='text-h3 mt-10 font-bold mb-5'>Resor</h2>
            <TripTable rentals={rentals} />
        </div>
    );
}
