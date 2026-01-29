'use client';
import React from 'react';

import { useSearchParams } from 'next/navigation';
import SingleBike from '../../../../../../components/userapp/rent-bike/SingleBike';

export default function page() {
    const searchParams = useSearchParams();
    const bikeId = searchParams.get('bikeId');

    if (!bikeId) {
        return <p>Loading bike...</p>;
    }
    return <SingleBike bikeId={bikeId} />;
}
