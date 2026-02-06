'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import Link from 'next/link';
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
import { useRouter } from 'next/navigation';
import SingleBikeMap from '../../../../map/SingleBikeMap';

/**
 * Single bike
 * @param {*} param0
 * @returns
 */
export default function SingleBike({ bikeId }) {
    const [bike, setBike] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();
    const refWs = useRef(null);
    const [bikeState, setBikeState] = useState(null);

    useEffect(() => {
        if (!bikeId) return;

        getSingelBike(bikeId)
            .then(setBike)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [bikeId]);

    useEffect(() => {
        if (!loading) {
            const ws = new WebSocket('ws://localhost:3000/ws/scooters');

            ws.onopen = () => {
                refWs.current = ws;

                ws.send(
                    JSON.stringify({
                        type: 'HELLO',
                        scooterId: bike._id,
                        role: 'admin',
                    })
                );

                console.log('Websocket connected');
            };

            ws.onmessage = (e) => {
                let msg;

                try {
                    msg = JSON.parse(e.data);
                    setBikeState(msg.state);
                } catch {
                    return;
                }

                console.log(msg);
            };

            ws.onerror = (e) => {
                console.log('WS error:', e);
            };

            ws.onclose = (e) => {
                console.log('WS close:', e.code);
            };

            return () => {
                ws.close();
                console.log('Websocket closed');
            };
        }
    }, [bike]);

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
        rented: {
            stop: true,
            lock: false,
            maintain: false,
            delete: false,
            ready: false,
        },
        charging: {
            stop: false,
            lock: true,
            maintain: true,
            delete: false,
            ready: true,
        },
        maintenance: {
            stop: false,
            lock: false,
            maintain: false,
            delete: true,
            ready: true,
        },
        offline: {
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

        await actionFn(bike);
        toast.success(actionName);
        router.push('/admin-dashboard/bikes');
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
                                        bike.status === 'available'
                                            ? 'text-green-400'
                                            : bike.status === 'rented'
                                            ? 'text-yellow-400'
                                            : bike.status === 'charging'
                                            ? 'text-blue-400'
                                            : bike.status === 'maintenance'
                                            ? 'text-orange-400'
                                            : bike.status === 'offline'
                                            ? 'text-gray-400'
                                            : bike.status === 'locked'
                                            ? 'text-red-400'
                                            : 'text-gray-400'
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
                        canDo(bike?.status, 'maintain')
                            ? 'hover:bg-detail-yellow hover:text-black'
                            : 'opacity-40 cursor-not-allowed'
                    }`}
                                        title={
                                            canDo(bike?.status, 'maintain')
                                                ? 'Service'
                                                : 'Cykeln är redan i service'
                                        }
                                    >
                                        <Wrench size={18} />
                                    </button>

                                    <button
                                        disabled={
                                            !canDo(bike?.status, 'delete')
                                        }
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
                        canDo(bike?.status, 'delete')
                            ? 'hover:bg-red-500 hover:text-black'
                            : 'opacity-40 cursor-not-allowed'
                    }`}
                                        title={
                                            canDo(bike?.status, 'delete')
                                                ? 'Ta bort'
                                                : 'Kan inte ta bort cykeln nu'
                                        }
                                    >
                                        <Trash2 size={18} />
                                    </button>

                                    <button
                                        disabled={!canDo(bike?.status, 'ready')}
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
                        canDo(bike?.status, 'ready')
                            ? 'hover:bg-green-500 hover:text-black'
                            : 'opacity-40 cursor-not-allowed'
                    }`}
                                        title={
                                            canDo(bike?.status, 'ready')
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
            {bikeState && (
                <div className='mt-10 mb-10 h-[400px]'>
                    <SingleBikeMap bike={bikeState} admin={true} />
                </div>
            )}
        </div>
    );
}
