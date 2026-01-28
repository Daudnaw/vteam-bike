'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Trash2,
    Lock,
    PauseCircle,
    Wrench,
    Bike,
    MapPin,
    Activity,
    Edit3,
} from 'lucide-react';

import {
    deleteBike,
    stopBike,
    lockBike,
    maintainBike,
    readyBike,
    getSingelBike,
} from '../../../../../src/app/actions/bikes';

export default function SingleBike({ bikeId }) {
    const [bike, setBike] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!bikeId) return;

        getSingelBike(bikeId)
            .then(setBike)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [bikeId]);

    if (loading) return <p>Loading bike...</p>;
    if (error) return <p className='text-red-500'>{error}</p>;
    if (!bike) return <p>bike not found</p>;

    const actionRules = {
        available: {
            stop: false,
            lock: true,
            maintain: true,
            delete: true,
            ready: false,
        },
        locked: {
            stop: false,
            lock: false,
            maintain: true,
            delete: true,
            ready: false,
        },
        riding: {
            stop: true,
            lock: false,
            maintain: false,
            delete: false,
            ready: false,
        },
        in_service: {
            stop: false,
            lock: false,
            maintain: false,
            delete: true,
            ready: true,
        },
    };

    const canDo = (status, action) => actionRules[status]?.[action] ?? false;

    const handleAction = async (actionFn, actionName, actionKey) => {
        if (!canDo(bike.status, actionKey)) {
            toast.info('Åtgärden är inte tillåten just nu');
            return;
        }

        await actionFn(bike.bikeId);
        toast.success(actionName);
    };

    return (
        <div>
            {/* <div className='flex justify-end mb-5'>
                <Link
                    href={`/admin-dashboard/bikes/update?bikeId=${bikeId}`}
                    className='inline-flex items-center gap-2 bg-detail-yellow text-black px-3 py-1 rounded hover:bg-yellow-600 transition text-sm'
                    title='Edit bike'
                >
                    <Edit3 size={16} />
                    Edit me
                </Link>
            </div> */}
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
                        <tr>
                            <td className='border border-detail-yellow px-2 py-4 text-center'>
                                {bike._id}
                            </td>

                            <td className='border border-detail-yellow px-2 py-4 text-center'>
                                <span
                                    className={`font-semibold ${
                                        bike.status === 'driving'
                                            ? 'text-green-400'
                                            : bike.status === 'idle'
                                            ? 'text-yellow-400'
                                            : bike.status === 'maintenance'
                                            ? 'text-orange-400'
                                            : 'text-red-400'
                                    }`}
                                >
                                    ●{' '}
                                    {bike.status.charAt(0).toUpperCase() +
                                        bike.status.slice(1)}
                                </span>
                            </td>

                            <td className='border border-detail-yellow px-2 py-4 text-center'>
                                {bike.lat}. {bike.lon}
                            </td>

                            <td className='border border-detail-yellow px-2 py-4 text-center'>
                                <div className='flex items-center justify-center gap-3'>
                                    <button
                                        disabled={!canDo(bike.status, 'stop')}
                                        onClick={() =>
                                            handleAction(
                                                stopBike,
                                                'Cykeln stoppad',
                                                'stop'
                                            )
                                        }
                                        className={`h-10 w-10 rounded-full border border-detail-yellow
                    flex items-center justify-center transition
                    ${
                        canDo(bike.status, 'stop')
                            ? 'hover:bg-detail-yellow hover:text-black'
                            : 'opacity-40 cursor-not-allowed'
                    }`}
                                        title={
                                            canDo(bike.status, 'stop')
                                                ? 'Stoppa'
                                                : 'Cykeln är redan stoppad'
                                        }
                                    >
                                        <PauseCircle size={18} />
                                    </button>

                                    <button
                                        disabled={!canDo(bike.status, 'lock')}
                                        onClick={() =>
                                            handleAction(
                                                lockBike,
                                                'Cykeln låst',
                                                'lock'
                                            )
                                        }
                                        className={`h-10 w-10 rounded-full border border-detail-yellow
                    flex items-center justify-center transition
                    ${
                        canDo(bike.status, 'lock')
                            ? 'hover:bg-detail-yellow hover:text-black'
                            : 'opacity-40 cursor-not-allowed'
                    }`}
                                        title={
                                            canDo(bike.status, 'lock')
                                                ? 'Lås'
                                                : 'Cykeln är redan låst'
                                        }
                                    >
                                        <Lock size={18} />
                                    </button>

                                    <button
                                        disabled={
                                            !canDo(bike.status, 'maintain')
                                        }
                                        onClick={() =>
                                            handleAction(
                                                maintainBike,
                                                'Cykeln satt i service',
                                                'maintain'
                                            )
                                        }
                                        className={`h-10 w-10 rounded-full border border-detail-yellow
                    flex items-center justify-center transition
                    ${
                        canDo(bike.status, 'maintain')
                            ? 'hover:bg-detail-yellow hover:text-black'
                            : 'opacity-40 cursor-not-allowed'
                    }`}
                                        title={
                                            canDo(bike.status, 'maintain')
                                                ? 'Service'
                                                : 'Cykeln är redan i service'
                                        }
                                    >
                                        <Wrench size={18} />
                                    </button>

                                    <button
                                        disabled={!canDo(bike.status, 'delete')}
                                        onClick={() =>
                                            handleAction(
                                                deleteBike,
                                                'Cykeln borttagen',
                                                'delete'
                                            )
                                        }
                                        className={`h-10 w-10 rounded-full border border-red-500 text-red-400
                    flex items-center justify-center transition
                    ${
                        canDo(bike.status, 'delete')
                            ? 'hover:bg-red-500 hover:text-black'
                            : 'opacity-40 cursor-not-allowed'
                    }`}
                                        title={
                                            canDo(bike.status, 'delete')
                                                ? 'Ta bort'
                                                : 'Kan inte ta bort cykeln nu'
                                        }
                                    >
                                        <Trash2 size={18} />
                                    </button>

                                    <button
                                        disabled={!canDo(bike.status, 'ready')}
                                        onClick={() =>
                                            handleAction(
                                                readyBike,
                                                'Cykeln är nu tillgänglig',
                                                'ready'
                                            )
                                        }
                                        className={`h-10 w-10 rounded-full border border-green-500 text-green-400
                    flex items-center justify-center transition
                    ${
                        canDo(bike.status, 'ready')
                            ? 'hover:bg-green-500 hover:text-black'
                            : 'opacity-40 cursor-not-allowed'
                    }`}
                                        title={
                                            canDo(bike.status, 'ready')
                                                ? 'Gör tillgänglig'
                                                : 'Kan inte göras tillgänglig'
                                        }
                                    >
                                        ✓
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
