'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { Trash2, Edit3 } from 'lucide-react';
import { getAllZones, deleteZone } from '../../../../../src/app/actions/zones';
import { Plus } from 'lucide-react';

/**
 * All zones.
 * @param {*} param0
 * @returns
 */
export default function ZonesList({ cityId }) {
    const [zones, setZones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        getAllZones()
            .then(setZones)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    async function handleDelete(zoneId) {
        if (!confirm('Are you sure you want to delete this zone?')) return;

        try {
            await deleteZone(zoneId);
            toast.success('Deleted successfully', { autoClose: 1500 });

            setZones((prev) => prev.filter((u) => u.id !== zoneId));
        } catch (err) {
            toast.error(err.message || 'Failed to delete the zone');
        }
    }

    if (loading) return <p>Loading zones...</p>;
    if (error) return <p>Error: {error}</p>;
    const visibleZones = zones.filter((z) => z.zoneType !== 'city');

    return (
        <div className='mb-10'>
            <div className='flex justify-between mb-2 items-center'>
                <h2 className='text-3xl text-black text-center'>Zoner</h2>
                <Link
                    href={`/admin-dashboard/zones/create?cityId=${cityId}`}
                    className='flex items-center gap-2 bg-detail-yellow text-black px-4 py-2 rounded hover:bg-yellow-600 transition'
                >
                    <Plus size={18} />
                    Skapa ny zon
                </Link>
            </div>

            <div className='overflow-hidden rounded-md border border-detail-yellow shadow-2xl'>
                <table className='w-full border-collapse text-white bg-slate-800'>
                    <thead className='bg-slate-900'>
                        <tr>
                            <th className='border border-detail-yellow text-2xl py-2 text-center'>
                                Zone Name
                            </th>
                            <th className='border border-detail-yellow text-2xl py-2 text-center'>
                                Type
                            </th>
                            <th className='border border-detail-yellow text-2xl py-2 text-center'>
                                Zonetype
                            </th>
                            <th className='border border-detail-yellow text-2xl py-2 text-center'>
                                Active
                            </th>
                            <th className='border border-detail-yellow text-2xl py-2 text-center'>
                                Action
                            </th>
                        </tr>
                    </thead>

                    <tbody className='divide-detail-yellow'>
                        {visibleZones.map((zone) => (
                            <tr key={zone.id}>
                                <td className='border border-detail-yellow px-2 py-2 text-center'>
                                    {zone.name}
                                </td>

                                <td className='border border-detail-yellow px-2 py-2 text-center'>
                                    {zone.type}
                                </td>

                                <td className='border border-detail-yellow px-2 py-2 text-center'>
                                    {zone.zoneType}
                                </td>

                                <td className='border border-detail-yellow px-2 py-2 text-center'>
                                    {zone.active ? 'Yes' : 'No'}
                                </td>

                                <td className='border border-detail-yellow px-2 py-2 text-center'>
                                    <div className='flex justify-center gap-3'>
                                        <Link
                                            href={`/admin-dashboard/zones/update?zoneId=${zone.id}`}
                                            className='flex items-center gap-1 text-blue-400 hover:text-detail-yellow'
                                        >
                                            <Edit3 size={18} />
                                            Edit
                                        </Link>

                                        <button
                                            onClick={() =>
                                                handleDelete(zone.id)
                                            }
                                            className='flex items-center gap-1 text-red-400 hover:text-detail-yellow'
                                        >
                                            <Trash2 size={18} />
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
