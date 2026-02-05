import React from 'react';
import {
    Bike,
    MapPin,
    Activity,
    Wrench,
    Plus,
    CircleAlert,
} from 'lucide-react';
import Link from 'next/link';
import { getBikes } from '../../../../../src/app/actions/bikes';

const statusConfig = {
    available: { label: 'Tillgänglig', color: 'text-green-400' },
    rented: { label: 'Används', color: 'text-yellow-400' },
    offline: { label: 'Offline', color: 'text-red-400' },
    idle: { label: 'Inaktiv', color: 'text-gray-400' },
    maintance: { label: 'Service', color: 'text-blue-400' },
};

/**
 * All bikes table.
 * @returns
 */
export default async function BikeTable() {
    const bikes = await getBikes();

    return (
        <div>
            <div className='overflow-hidden rounded-md border border-detail-yellow shadow-2xl'>
                <table className='w-full border-collapse divide-detail-yellow from-slate-600 to-slate-800 bg-linear-to-br text-white'>
                    <thead className='bg-slate-900'>
                        <tr>
                            <th className='border border-detail-yellow text-2xl py-2 text-center'>
                                <div className='flex gap-2 items-center justify-center'>
                                    <Bike className='text-detail-yellow' />
                                    Cykel (id)
                                </div>
                            </th>
                            <th className='border border-detail-yellow text-2xl py-2 text-center'>
                                <div className='flex gap-2 items-center justify-center'>
                                    <Activity className='text-detail-yellow' />
                                    Status
                                </div>
                            </th>
                            <th className='border border-detail-yellow text-2xl py-2 text-center'>
                                <div className='flex gap-2 items-center justify-center'>
                                    <Activity className='text-detail-yellow' />
                                    Batteri
                                </div>
                            </th>
                            <th className='border border-detail-yellow text-2xl py-2 text-center'>
                                <div className='flex gap-2 items-center justify-center'>
                                    <MapPin className='text-detail-yellow' />
                                    Plats (lat, lon)
                                </div>
                            </th>
                            <th className='border border-detail-yellow text-2xl py-2 text-center'>
                                <div className='flex gap-2 items-center justify-center'>
                                    <Wrench className='text-detail-yellow' />
                                    Åtgärder
                                </div>
                            </th>
                        </tr>
                    </thead>

                    <tbody className='divide-detail-yellow'>
                        {bikes?.map((bike) => {
                            const status = statusConfig[bike.status] || {
                                label: 'Okänd',
                                color: 'text-gray-400',
                            };

                            return (
                                <tr key={bike._id}>
                                    <td className='border border-detail-yellow px-2 py-2 text-center'>
                                        {bike._id}
                                    </td>

                                    <td className='border border-detail-yellow px-2 py-2 text-center'>
                                        <span
                                            className={`font-semibold ${status.color}`}
                                        >
                                            ● {status.label}
                                        </span>
                                    </td>

                                    <td className='border border-detail-yellow px-2 py-2 text-center'>
                                        {parseInt(bike.battery) <= 20 ? (
                                            <span className='text-red-400 flex items-center gap-2 justify-center'>
                                                {bike.battery} %{' '}
                                                <CircleAlert className='h-4 w-4' />
                                            </span>
                                        ) : (
                                            <span className='text-green-400'>
                                                {bike.battery} %
                                            </span>
                                        )}
                                    </td>

                                    <td className='border border-detail-yellow px-2 py-2 text-center'>
                                        {bike.lat}, {bike.lon}
                                    </td>

                                    <td className='border border-detail-yellow px-2 py-2 text-center'>
                                        <Link
                                            href={`/admin-dashboard/bikes/single?bikeId=${bike._id}`}
                                            className='underline underline-offset-4 hover:decoration-detail-yellow'
                                        >
                                            Hantera
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
