import React from 'react';
import { Bike, MapPin, Activity, Wrench } from 'lucide-react';
import Link from 'next/link';
import { getBikes } from '../../../../../src/app/actions/bikes';

/**
 * All bikes in service.
 * @returns
 */
export default async function ServiceBikes() {
    const bikes = await getBikes();

    const serviceBikes = bikes.filter((bike) => bike.status === 'in_service');

    return (
        <div className='overflow-hidden rounded-md border border-detail-yellow shadow-2xl'>
            <table className='w-full border-collapse divide-detail-yellow from-slate-600 to-slate-800 bg-linear-to-br text-white'>
                <thead className='bg-slate-900'>
                    <tr>
                        <th className='border border-detail-yellow text-2xl py-2 text-center'>
                            <div className='flex gap-2 items-center justify-center'>
                                <Bike className='text-detail-yellow' />
                                Cykel
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
                                <MapPin className='text-detail-yellow' />
                                Plats
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

                <tbody>
                    {serviceBikes.map((bike) => (
                        <tr key={bike.bikeId}>
                            <td className='border border-detail-yellow px-2 py-2 text-center'>
                                {bike.bikeId}
                            </td>

                            <td className='border border-detail-yellow px-2 py-2 text-center text-red-400 font-semibold'>
                                ● Service
                            </td>

                            <td className='border border-detail-yellow px-2 py-2 text-center'>
                                {bike.position}
                            </td>

                            <td className='border border-detail-yellow px-2 py-2 text-center'>
                                <Link
                                    href={`/admin-dashboard/bikes/single?bikeId=${bike.bikeId}`}
                                    className='underline underline-offset-4'
                                >
                                    Hantera
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
