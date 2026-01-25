'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { MoreVertical, Trash2, Plus } from 'lucide-react';
import { getAllCities, deleteZone } from '../../../../../src/app/actions/zones';
import CityCard from './CityCard';

export default function CitiesList() {
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        getAllCities()
            .then(setCities)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    async function handleDelete(zoneId) {
        if (!confirm('Are you sure you want to delete this city?')) return;

        try {
            await deleteZone(zoneId);
            toast.success('Deleted successfully', { autoClose: 1500 });

            setCities((prev) => prev.filter((u) => u._id !== zoneId));
        } catch (err) {
            toast.error(err.message || 'Failed to delete city');
        }
    }

    if (loading) return <p>Loading cities...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className='mb-10'>
            <h2 className='text-h2 font-bold mb-4 '>Städer</h2>
            <div className='flex justify-end mb-2'>
                <div className='flex justify-between items-center'>
                    <Link
                        href='/admin-dashboard/cities/create'
                        className='flex items-center gap-2 bg-detail-yellow text-black px-4 py-2 rounded hover:bg-yellow-600 transition'
                    >
                        <Plus size={18} />
                        Skapa ny stad
                    </Link>
                </div>
            </div>
            <div className='flex gap-5 flex-wrap'>
                {cities.map((city) => (
                    <div key={city._id} className='flex'>
                        <CityCard name={city.name} id={city._id} />
                    </div>
                ))}
            </div>
        </div>
    );
}
