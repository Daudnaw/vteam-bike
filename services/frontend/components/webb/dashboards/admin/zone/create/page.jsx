'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { createZone } from '../../../../../../src/app/actions/zones';

/**
 * Create a new zone.
 * @param {*} param0
 * @returns
 */
export default function CreateNewZone({ cityId }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [type, setType] = useState('circle');
    const [zoneType, setZoneType] = useState('parking');

    async function handleAction(formData) {
        try {
            setLoading(true);
            setError(null);

            const name = formData.get('name');
            const active = true;

            const payload = { name, type, zoneType, active };

            if (zoneType === 'speed_limit') {
                const maxSpeed = Number(formData.get('maxSpeed'));

                if (Number.isNaN(maxSpeed)) {
                    throw new Error('Invalid speed limit');
                }

                payload.maxSpeed = maxSpeed;
            }

            if (type === 'polygon') {
                const areaText = formData.get('area');
                if (!areaText)
                    throw new Error('Area is required for polygons.');

                const area = areaText
                    .split('\n')
                    .map((line) => line.trim())
                    .filter(Boolean)
                    .map((line) => {
                        const [lat, lng] = line.split(',').map(Number);
                        if (Number.isNaN(lat) || Number.isNaN(lng)) {
                            throw new Error(
                                'Invalid polygon coordinate format'
                            );
                        }
                        return [lat, lng];
                    });

                payload.area = area;
            }

            if (type === 'circle') {
                const lat = Number(formData.get('lat'));
                const lng = Number(formData.get('lng'));
                const radius = Number(formData.get('radius'));

                if (
                    Number.isNaN(lat) ||
                    Number.isNaN(lng) ||
                    Number.isNaN(radius)
                ) {
                    throw new Error('Invalid circle values');
                }

                payload.center = [lat, lng];
                payload.radius = radius;
            }

            await createZone(payload);

            toast.success('Zone created successfully', { autoClose: 1500 });

            setTimeout(() => {
                router.push(`/admin-dashboard/cities/update?cityId=${cityId}`);
            }, 1500);
        } catch (err) {
            setError(err.message || 'Failed to create zone');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='w-md mx-auto border border-detail-yellow rounded-md p-6 shadow-xl from-slate-600 to-slate-800 bg-linear-to-br'>
            <h2 className='text-3xl text-white mb-6 text-center'>Skapa zon</h2>

            <form action={handleAction}>
                <input
                    name='name'
                    required
                    placeholder='Zone namn...'
                    className='w-full bg-slate-200 p-2 rounded-md text-xl mt-3 h-14 border-detail border-2 text-black'
                />

                <select
                    value={zoneType}
                    onChange={(e) => setZoneType(e.target.value)}
                    className='w-full bg-slate-200 p-2 rounded-md text-xl mt-3 h-14 border-detail border-2 text-black'
                >
                    <option value='parking'>Parking</option>
                    <option value='speed_limit'>Speed limit</option>
                    <option value='no_go'>No-go</option>
                    <option value='charge_station'>Charge station</option>
                    <option value='custom'>Custom</option>
                </select>

                {zoneType === 'speed_limit' && (
                    <input
                        name='maxSpeed'
                        required
                        type='number'
                        min={0}
                        max={50}
                        placeholder='Max speed (km/h)'
                        className='w-full bg-slate-200 p-2 rounded-md text-xl mt-3 h-14 border-detail border-2 text-black'
                    />
                )}

                <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className='w-full bg-slate-200 p-2 rounded-md text-xl mt-3 h-14 border-detail border-2 text-black'
                >
                    <option value='polygon'>Polygon</option>
                    <option value='circle'>Circle</option>
                </select>

                {type === 'polygon' && (
                    <textarea
                        name='area'
                        required
                        rows={6}
                        placeholder={`One coordinate per line\nlat,lng`}
                        className='w-full bg-slate-200 p-2 rounded-md text-lg mt-3 border-detail border-2 text-black'
                    />
                )}

                {type === 'circle' && (
                    <>
                        <input
                            name='lat'
                            required
                            placeholder='Center latitude'
                            className='w-full bg-slate-200 p-2 rounded-md text-xl mt-3 h-14 border-detail border-2 text-black'
                        />
                        <input
                            name='lng'
                            required
                            placeholder='Center longitude'
                            className='w-full bg-slate-200 p-2 rounded-md text-xl mt-3 h-14 border-detail border-2 text-black'
                        />
                        <input
                            name='radius'
                            required
                            placeholder='Radius (meters)'
                            className='w-full bg-slate-200 p-2 rounded-md text-xl mt-3 h-14 border-detail border-2 text-black'
                        />
                    </>
                )}

                {error && <p className='mt-2 text-detail-red'>{error}</p>}

                <button
                    type='submit'
                    className='bg-detail-yellow text-black rounded-md w-full text-h4 text-center mt-5 py-2 hover:opacity-90'
                >
                    {loading ? 'Skapar zon...' : 'Skapa zon'}
                </button>
            </form>
        </div>
    );
}
