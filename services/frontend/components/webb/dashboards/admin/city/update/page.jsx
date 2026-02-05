'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Edit3, Plus } from 'lucide-react';
import { getSingelZone } from '../../../../../../src/app/actions/zones';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { deleteZone } from '../../../../../../src/app/actions/zones';
import { useRouter } from 'next/navigation';

/**
 * Update a city.
 * @param {*} param0
 * @returns
 */
export default function UpdateCity({ cityId }) {
    const [city, setCity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();

    async function handleDelete(zoneId) {
        if (!confirm('Are you sure you want to delete this city?')) return;

        try {
            await deleteZone(zoneId);
            toast.success('Deleted successfully', { autoClose: 1500 });

            setTimeout(() => {
                router.push('/admin-dashboard/cities');
            }, 1500);
        } catch (err) {
            toast.error(err.message || 'Failed to delete city');
        }
    }

    useEffect(() => {
        if (!cityId) return;

        getSingelZone(cityId)
            .then(setCity)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [cityId]);

    if (loading) return <p>Loading city...</p>;
    if (error) return <p className='text-red-500'>{error}</p>;
    if (!city) return <p>City not found</p>;

    return (
        <div className=''>
            <div className='relative h-[400px] w-full'>
                <Image src='/city.png' alt='City' fill={true} />
            </div>
            <div className='flex justify-between items-center my-5'>
                <h2 className='text-h3 font-bold flex items-center gap-2'>
                    {city.name}
                </h2>
                <div className='flex gap-5'>
                    <button
                        onClick={() => handleDelete(cityId)}
                        className='p-4 rounded border bg-detail-red text-white items-center flex gap-2 cursor-pointer'
                    >
                        <Edit3 size={22} /> <span>Ta bort</span>
                    </button>
                    <Link
                        href={`/admin-dashboard/zones/update?cityId=${cityId}`}
                        className='p-4 rounded border bg-slate-800 text-detail-yellow items-center flex gap-2'
                        title='Edit city'
                    >
                        <Edit3 size={22} /> <span>Ändra</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
