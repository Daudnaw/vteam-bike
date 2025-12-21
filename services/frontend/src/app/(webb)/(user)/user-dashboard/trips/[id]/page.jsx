import React from 'react';
import SingleTrip from '../../../../../../../components/webb/dashboards/shared/SingleTrip';

const sampleTrip = {
    id: 0,
    name: 'Trip',
    from_long: '13.000076',
    from_lat: '55.606641',
    to_long: '12.848637',
    to_lat: '55.570629',
    date: '12-05-2025',
};

export default async function Page({ params }) {
    const { id } = await params;

    async function getTrip(id) {
        'use server';

        return sampleTrip;
    }

    const trip = await getTrip();
    return (
        <div>
            <SingleTrip trip={trip} />
        </div>
    );
}
