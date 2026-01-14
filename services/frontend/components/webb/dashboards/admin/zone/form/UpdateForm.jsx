'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import {
    getSingelZone,
    updateZone,
} from '../../../../../../src/app/actions/zones';

export default function UpdateZonePage({ zoneId }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [name, setName] = useState('');
    const [type, setType] = useState('polygon');
    const [zoneType, setZoneType] = useState('parking');

    const [area, setArea] = useState('');
    const [lat, setLat] = useState('');
    const [lng, setLng] = useState('');
    const [radius, setRadius] = useState('');

    const [maxSpeed, setMaxSpeed] = useState('');

    useEffect(() => {
        async function fetchZone() {
            try {
                const zone = await getSingelZone(zoneId);

                setName(zone.name);
                setType(zone.type);
                setZoneType(zone.zoneType);

                if (zone.zoneType === 'speed_limit') {
                    setMaxSpeed(zone.maxSpeed);
                }

                if (zone.type === 'polygon') {
                    setArea(zone.area.map((p) => `${p[0]},${p[1]}`).join('\n'));
                }

                if (zone.type === 'circle') {
                    setLat(zone.center[0]);
                    setLng(zone.center[1]);
                    setRadius(zone.radius);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchZone();
    }, [zoneId]);

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            setLoading(true);
            setError(null);

            const payload = {
                name,
                type,
                zoneType,
                active: true,
            };

            if (zoneType === 'speed_limit') {
                payload.maxSpeed = Number(maxSpeed);
            }

            if (type === 'polygon') {
                payload.area = area
                    .split('\n')
                    .map((line) => line.trim())
                    .filter(Boolean)
                    .map((line) => line.split(',').map(Number));
            }

            if (type === 'circle') {
                payload.center = [Number(lat), Number(lng)];
                payload.radius = Number(radius);
            }

            await updateZone(zoneId, payload);

            toast.success('Zone updated successfully', { autoClose: 1500 });
            setTimeout(() => router.back(), 1500);
        } catch (err) {
            setError(err.message || 'Failed to update zone');
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <p>Loading zone...</p>;
    if (error) return <p className='text-detail-red'>{error}</p>;

    return (
        <div className='w-md mx-auto border border-detail-yellow rounded-md p-6 shadow-xl from-slate-600 to-slate-800 bg-linear-to-br'>
            <h2 className='text-3xl text-white mb-6 text-center'>
                Update Zone
            </h2>

            <form onSubmit={handleSubmit}>
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder='Zone name'
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
                        type='number'
                        min={0}
                        max={50}
                        value={maxSpeed}
                        onChange={(e) => setMaxSpeed(e.target.value)}
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
                        rows={6}
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        placeholder='lat,lng per line'
                        className='w-full bg-slate-200 p-2 rounded-md text-lg mt-3 border-detail border-2 text-black'
                    />
                )}

                {type === 'circle' && (
                    <>
                        <input
                            value={lat}
                            onChange={(e) => setLat(e.target.value)}
                            placeholder='Center latitude'
                            className='w-full bg-slate-200 p-2 rounded-md text-xl mt-3 h-14 border-detail border-2 text-black'
                        />
                        <input
                            value={lng}
                            onChange={(e) => setLng(e.target.value)}
                            placeholder='Center longitude'
                            className='w-full bg-slate-200 p-2 rounded-md text-xl mt-3 h-14 border-detail border-2 text-black'
                        />
                        <input
                            value={radius}
                            onChange={(e) => setRadius(e.target.value)}
                            placeholder='Radius (meters)'
                            className='w-full bg-slate-200 p-2 rounded-md text-xl mt-3 h-14 border-detail border-2 text-black'
                        />
                    </>
                )}

                {error && <p className='mt-2 text-detail-red'>{error}</p>}

                <button
                    type='submit'
                    className='bg-detail-yellow text-black rounded-md w-full text-h4 mt-5 py-2'
                >
                    {loading ? 'Updating...' : 'Update zone'}
                </button>
            </form>
        </div>
    );
}
