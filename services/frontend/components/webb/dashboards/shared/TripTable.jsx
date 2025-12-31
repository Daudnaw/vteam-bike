import React from 'react';
import { Timer, MapPin, Motorbike, Ruler, CircleAlert } from 'lucide-react';
import Link from 'next/link';

const trips = [
    {
        id: 1,
        city: 'Karlskrona',
        bike_id: 1,
        length: 42,
        time: 28,
    },
    {
        id: 2,
        city: 'Ronneby',
        bike_id: 1,
        length: 68,
        time: 43,
    },
    {
        id: 3,
        city: 'Karlshamn',
        bike_id: 2,
        length: 32,
        time: 24,
    },
    {
        id: 4,
        city: 'Karlshamn',
        bike_id: 3,
        length: 105,
        time: 222,
    },
    {
        id: 5,
        city: 'Karlshamn',
        bike_id: 4,
        length: 78,
        time: 10,
    },
];

export default function TripTable() {
    return (
        <div className='overflow-hidden rounded-md border border-detail-yellow shadow-2xl'>
            <table className='w-full border-collapse divide-detail-yellow from-slate-600 to-slate-800 bg-linear-to-br text-white p-5'>
                <thead className='bg-slate-900'>
                    <tr className=''>
                        <th className='border border-detail-yellow text-2xl py-2 text-white text-center'>
                            <div className='flex gap-2 w-full items-center justify-center'>
                                <MapPin className='text-detail-yellow' /> Stad
                            </div>
                        </th>
                        <th className='border border-detail-yellow text-2xl py-2 text-white text-center'>
                            <div className='flex gap-2 w-full items-center justify-center'>
                                <Motorbike className='text-detail-yellow' />{' '}
                                Cykel (id)
                            </div>
                        </th>
                        <th className='border border-detail-yellow text-2xl py-2 text-white text-center'>
                            <div className='flex gap-2 w-full items-center justify-center'>
                                <Ruler className='text-detail-yellow' /> Längd
                                (km)
                            </div>
                        </th>
                        <th className='border border-detail-yellow text-2xl py-2 text-white text-center'>
                            <div className='flex gap-2 w-full items-center justify-center'>
                                <Timer className='text-detail-yellow' /> Tid
                                (min)
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
                    {trips.map((trip) => {
                        return (
                            <tr key={trip.id}>
                                <td className='border border-detail-yellow px-2 py-2 text-center'>
                                    {trip.city}
                                </td>
                                <td className='border border-detail-yellow px-2 py-2 text-center'>
                                    {trip.bike_id}
                                </td>
                                <td className='border border-detail-yellow px-2 py-2 text-center'>
                                    {trip.length}
                                </td>
                                <td className='border border-detail-yellow px-2 py-2 text-center'>
                                    {trip.time}
                                </td>
                                <td className='border border-detail-yellow px-2 py-2 text-center'>
                                    <Link
                                        href={`/user-dashboard/trips/${trip.id}`}
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
