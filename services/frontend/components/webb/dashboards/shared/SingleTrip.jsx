import React from 'react';
import { Calendar, ArrowLeft, DollarSign } from 'lucide-react';
import Link from 'next/link';

export default function SingleTrip({ trip }) {
    function formatTime(date) {
        const newDate = new Date(date);

        const formatDate =
            newDate.getFullYear() +
            '/' +
            newDate.getMonth() +
            1 +
            '/' +
            newDate.getDate();

        return formatDate;
    }

    return (
        <div className='p-5'>
            <Link href='/user-dashboard/trips'>
                <ArrowLeft className='h-10 w-10 hover:text-detail-yellow' />
            </Link>
            <div className='flex items-center gap-2'>
                <Calendar className='h-8 w-8 text-detail-yellow' />
                <h2 className='text-h2  flex items-center gap-2'>
                    Datum:{' '}
                    <span className='font-bold'>
                        {formatTime(trip.startTime)}
                    </span>
                </h2>
            </div>

            <div className='flex items-center gap-2'>
                <DollarSign className='h-8 w-8 text-detail-yellow' />
                <h2 className='text-h2   flex items-center gap-2'>
                    Kostnad: <span className='font-bold'>{trip.cost}</span> kr
                </h2>
            </div>

            <div className='h-[400px] flex justify-center items-center font-bold'>
                <p>Karta över resan</p>
            </div>
        </div>
    );
}
