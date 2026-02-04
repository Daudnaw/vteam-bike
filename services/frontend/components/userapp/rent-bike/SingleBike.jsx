import React, { useEffect, useState } from 'react';
import { getSingelBike } from '../../../src/app/actions/bikes';
import { BatteryMedium } from 'lucide-react';
import { rentBike, endRental } from '../../../src/app/actions/rental';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export default function SingleBike({ bikeId }) {
    const [bike, setBike] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [scooter, setScooter] = useState(null);

    useEffect(() => {
        if (!bikeId) return;

        getSingelBike(bikeId)
            .then(setBike)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [bikeId]);

    if (loading) return <p>Loading bike...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!bike) return <p>bike not found</p>;

    async function rentNewBike() {
        const res = await rentBike(bike._id);
        toast.success('Hyrning lyckades', { autoClose: 1500 });

        setScooter(res);
    }

    async function endActiveRental() {
        const res = await endRental(scooter._id);
        toast.success('Resa avslutades', { autoClose: 1500 });
        setScooter(null);
    }

    return (
        <div className="p-5">
            <h2 className="text-h2">Hyr cykel</h2>
            <div className="h-1 bg-slate-800 w-full my-5" />
            <div className=" w-full bg-slate-800 flex flex-col justify-center items-center h-[250px] rounded-lg">
                <BatteryMedium className="text-green-500 h-20 w-20" />
                <span className="flex gap-2 items-center mb-5 text-white text-3xl">
                    Batteri:{' '}
                    <span className="text-detail-yellow">{bike.battery} %</span>
                </span>
            </div>
            <button
                type="button"
                onClick={!scooter ? rentNewBike : endActiveRental}
                className="w-full text-detail-yellow py-4 bg-slate-800 text-h3 text-center mt-5 rounded-lg border-detail-yellow border-2"
            >
                {!scooter ? 'Hyr cykel' : 'Avsluta resan'}
            </button>
        </div>
    );
}
