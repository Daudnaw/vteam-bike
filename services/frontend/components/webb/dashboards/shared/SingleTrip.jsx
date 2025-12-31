import React from 'react';
import TripMap from '../../../map/TripMap';
import { Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SingleTrip({ trip }) {
    return (
        <div className='p-5'>
            <Link href='/user-dashboard'>
                <ArrowLeft className='h-10 w-10 hover:text-detail-yellow' />
            </Link>
            <h2 className='text-h2 font-bold mb-5 flex items-center gap-2'>
                Datum: <span className='font-bold'>{trip.date}</span>
            </h2>
            <TripMap
                startPos={[trip.from_lat, trip.from_long]}
                endPos={[trip.to_lat, trip.to_long]}
            />
        </div>
    );
}
