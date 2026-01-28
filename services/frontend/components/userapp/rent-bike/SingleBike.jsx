import React, { useEffect, useState } from 'react';
import { getSingelBike } from '../../../src/app/actions/bikes';
import { BatteryMedium } from 'lucide-react';
import { rentBike } from '../../../src/app/actions/rental';

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

    async function rentNewBike() {
        const res = await rentBike(bike._id);
        console.log(res);
    }

    return (
        <div className='p-5'>
            <h2 className='text-h2'>Hyr cykel</h2>
            <div className='h-1 bg-slate-800 w-full my-5' />
            <div className=' w-full bg-slate-800 flex flex-col justify-center items-center h-[250px] rounded-lg'>
                <BatteryMedium className='text-green-500 h-20 w-20' />
                <span className='flex gap-2 items-center mb-5 text-white text-3xl'>
                    Batteri:{' '}
                    <span className='text-detail-yellow'>{bike.battery} %</span>
                </span>
            </div>
            <button
                onClick={() => rentNewBike()}
                className='w-full text-detail-yellow py-4 bg-slate-800 text-h3 text-center mt-5 rounded-lg border-detail-yellow border-2'
            >
                Hyr
            </button>
        </div>
    );
}
