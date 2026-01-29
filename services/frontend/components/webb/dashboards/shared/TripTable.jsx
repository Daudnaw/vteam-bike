import React from 'react';
import {
    Timer,
    MapPin,
    Motorbike,
    Calendar,
    CircleAlert,
    DollarSign,
} from 'lucide-react';
import Link from 'next/link';

export default function TripTable({ rentals }) {
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
        <div className='overflow-hidden rounded-md border border-detail-yellow shadow-2xl'>
            <table className='w-full border-collapse divide-detail-yellow from-slate-600 to-slate-800 bg-linear-to-br text-white p-5'>
                <thead className='bg-slate-900'>
                    <tr className=''>
                        <th className='border border-detail-yellow text-2xl py-2 text-white text-center'>
                            <div className='flex gap-2 w-full items-center justify-center'>
                                <Calendar className='text-detail-yellow' />{' '}
                                Datum
                            </div>
                        </th>
                        <th className='border border-detail-yellow text-2xl py-2 text-white text-center'>
                            <div className='flex gap-2 w-full items-center justify-center'>
                                <DollarSign className='text-detail-yellow' />{' '}
                                Kostnad
                            </div>
                        </th>

                        <th className='border border-detail-yellow text-2xl py-2 text-white text-center'>
                            <div className='flex gap-2 w-full items-center justify-center'>
                                <CircleAlert className='text-detail-yellow' />
                                Åtgärder
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody className='divide-detail-yellow'>
                    {rentals?.map((rental) => {
                        return (
                            <tr key={rental._id}>
                                <td className='border border-detail-yellow px-2 py-2 text-center'>
                                    {formatTime(rental.startTime)}
                                </td>
                                <td className='border border-detail-yellow px-2 py-2 text-center'>
                                    {rental.cost}
                                </td>

                                <td className='border border-detail-yellow px-2 py-2 text-center'>
                                    <Link
                                        href={`/user-dashboard/trips/${rental._id}`}
                                        className='underline underline-offset-4 hover:decoration-detail-yellow'
                                    >
                                        Se mer
                                    </Link>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
