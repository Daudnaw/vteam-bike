'use client';

import React from 'react';
import ZonesAndBikeMap from '../../../../../../components/map/ZoneBike';

export default function MapPage() {
    return (
        <div className='p-5'>
            <h2 className='text-h2 mb-5 font-bold'>Översikt Bikes and Zones</h2>
            <ZonesAndBikeMap />
        </div>
    );
}
