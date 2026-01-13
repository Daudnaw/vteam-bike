'use client';

import React from 'react';
import ZonesOnly from '../../../../../../components/map/ZonesOnly';

export default function MapPage() {
    return (
        <div className='p-5'>
            <h2 className='text-h2 mb-5 font-bold'>Översikt Zoner</h2>
            <ZonesOnly />
        </div>
    );
}
