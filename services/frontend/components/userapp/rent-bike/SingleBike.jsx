import React, { useEffect, useState } from 'react';
import { getSingelBike } from '../../../src/app/actions/bikes';
import { BatteryMedium } from 'lucide-react';
import { rentBike, endRental } from '../../../src/app/actions/rental';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import SingleBikeMap from '../../map/SingleBikeMap';

/**
 * Rent a bike on user app.
 * @param {*} param0
 * @returns
 */
export default function SingleBike({ bikeId }) {
    const [bike, setBike] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [scooter, setScooter] = useState(null);
    const [bikeState, setBikeState] = useState(null);

    useEffect(() => {
        if (!bikeId) return;

        getSingelBike(bikeId)
            .then(setBike)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [bikeId]);

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:3000/ws/scooters');

        ws.onopen = () => {
            ws.send(
                JSON.stringify({
                    type: 'HELLO',
                    scooterId: bikeId,
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
    }, [bikeId]);

    if (loading) return <p>Loading bike...</p>;
    if (error) return <p className='text-red-500'>{error}</p>;
    if (!bike) return <p>bike not found</p>;

    // Rent new bike.
    async function rentNewBike() {
        const res = await rentBike(bike._id);

        if (res.message) {
            toast.error(res.message, { autoClose: 1500 });
        } else {
            toast.success('Hyrning lyckades', { autoClose: 1500 });
            setBikeState(bikeState);
            setScooter(res);
        }
    }

    // End active rental.
    async function endActiveRental() {
        const res = await endRental(scooter._id);
        toast.success('Resa avslutades', { autoClose: 1500 });
        setScooter(null);
    }

    return (
        <div className='p-5'>
            <h2 className='text-h2'>Hyr cykel</h2>
            <p>
                Notera att resan bara går att betla med credits, dessa går bara
                att köpa i user-webb
            </p>
            <div className='h-1 bg-slate-800 w-full my-5' />
            <div className=' w-full bg-slate-800 flex flex-col justify-center items-center h-[250px] rounded-lg'>
                <BatteryMedium className='text-green-500 h-20 w-20' />
                <span className='flex gap-2 items-center mb-5 text-white text-3xl'>
                    Batteri:{' '}
                    <span className='text-detail-yellow'>{bike.battery} %</span>
                </span>
            </div>
            <button
                type='button'
                onClick={!scooter ? rentNewBike : endActiveRental}
                className='w-full text-detail-yellow py-4 bg-slate-800 text-h3 text-center mt-5 rounded-lg border-detail-yellow border-2'
            >
                {!scooter ? 'Hyr cykel' : 'Avsluta resan'}
            </button>
            {/* {bikeState && (
                <div className='my-10'>
                    <div className='mt-10 mb-10 h-[400px]'>
                        <SingleBikeMap bike={bikeState} admin={false} />
                    </div>
                </div>
            )} */}
        </div>
    );
}
