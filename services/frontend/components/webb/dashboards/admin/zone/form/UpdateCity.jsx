'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import {
    getSingelZone,
    updateZone,
} from '../../../../../../src/app/actions/zones';

/**
 * Update a city.
 * @param {*} param0
 * @returns
 */
export default function UpdateCity({ cityId }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [name, setName] = useState('');
    const [active, setActive] = useState(true);

    const [area, setArea] = useState('');

    useEffect(() => {
        async function fetchCity() {
            try {
                const city = await getSingelZone(cityId);

                if (city.zoneType !== 'city') {
                    throw new Error('This zone is not a city');
                }

                setName(city.name);
                setActive(city.active);

                setArea(city.area.map((p) => `${p[0]},${p[1]}`).join('\n'));
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchCity();
    }, [cityId]);

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            setLoading(true);
            setError(null);

            const parsedArea = area
                .split('\n')
                .map((line) => line.trim())
                .filter(Boolean)
                .map((line) => {
                    const [lat, lng] = line.split(',').map(Number);
                    if (Number.isNaN(lat) || Number.isNaN(lng)) {
                        throw new Error('Invalid coordinate format');
                    }
                    return [lat, lng];
                });

            const payload = {
                name,
                active,
                type: 'polygon',
                zoneType: 'city',
                area: parsedArea,
            };

            await updateZone(cityId, payload);

            toast.success('City updated successfully', { autoClose: 1500 });
            setTimeout(() => router.back(), 1500);
        } catch (err) {
            setError(err.message || 'Failed to update city');
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <p>Loading city...</p>;
    if (error) return <p className='text-detail-red'>{error}</p>;

    return (
        <div className='w-md mx-auto border border-detail-yellow rounded-md p-6 shadow-xl from-slate-600 to-slate-800 bg-linear-to-br'>
            <h2 className='text-3xl text-white mb-6 text-center'>
                Update City
            </h2>

            <form onSubmit={handleSubmit}>
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder='City name'
                    className='w-full bg-slate-200 p-2 rounded-md text-xl mt-3 h-14 border-detail border-2 text-black'
                />

                <select
                    value={active ? 'true' : 'false'}
                    onChange={(e) => setActive(e.target.value === 'true')}
                    className='w-full bg-slate-200 p-2 rounded-md text-xl mt-3 h-14 border-detail border-2 text-black'
                >
                    <option value='true'>Active</option>
                    <option value='false'>Inactive</option>
                </select>

                <textarea
                    rows={6}
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder='lat,lng per line'
                    className='w-full bg-slate-200 p-2 rounded-md text-lg mt-3 border-detail border-2 text-black'
                />

                {error && <p className='mt-2 text-detail-red'>{error}</p>}

                <button
                    type='submit'
                    className='bg-detail-yellow text-black rounded-md w-full text-h4 mt-5 py-2'
                >
                    {loading ? 'Updating...' : 'Update city'}
                </button>
            </form>
        </div>
    );
}
