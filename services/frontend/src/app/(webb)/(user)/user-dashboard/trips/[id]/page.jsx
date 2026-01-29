import React from 'react';
import SingleTrip from '../../../../../../../components/webb/dashboards/shared/SingleTrip';
import { getSingleRental } from '../../../../../actions/rental';

export default async function Page({ params }) {
    const { id } = await params;

    const rental = await getSingleRental(id);

    return (
        <div>
            <SingleTrip trip={rental} />
        </div>
    );
}
