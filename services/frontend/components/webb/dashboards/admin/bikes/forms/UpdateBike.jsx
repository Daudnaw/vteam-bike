'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

import {
    getSingelBike,
    updateBike,
} from '../../../../../../src/app/actions/bikes';

export default function UpdateBike({ bikeId }) {
    const router = useRouter();
    const [bike, setBike] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [form, setForm] = useState({
        status: '',
        position: '',
        city: '',
    });

    useEffect(() => {
        if (!bikeId) return;

        getSingelBike(bikeId)
            .then(setBike)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [bikeId]);

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);

            const res = await updateBike(bikeId, form);

            if (res.ok) {
                toast.success('bike updated successfully', { autoClose: 1500 });
            }

            setTimeout(() => router.back(), 1500);
        } catch (err) {
            setError(err);
        }
        setLoading(false);
    }

    if (loading) return <p>Loading bike...</p>;
    if (error) return <p className='text-red-500'>{error}</p>;
    if (!bike) return <p>bike not found</p>;

    return (
        <div className='p-4 border rounded bg-white shadow-sm max-w-md mx-auto'>
            <h1 className='text-xl font-semibold mb-4'>Update Bike</h1>

            <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                <div>
                    <label className='block font-medium mb-1'>Bike ID</label>
                    <input
                        type='text'
                        value={bike._id}
                        readOnly
                        className='w-full border px-3 py-2 rounded bg-gray-100'
                    />
                </div>

                <div>
                    <label className='block font-medium mb-1'>Status</label>
                    <select
                        value={form.status}
                        onChange={(e) =>
                            setForm({ ...form, status: e.target.value })
                        }
                        className='w-full border px-3 py-2 rounded'
                        required
                    >
                        <option value=''>Select status</option>
                        <option value='available'>Available</option>
                        <option value='in_use'>In Use</option>
                        <option value='in_service'>In Service</option>
                        <option value='locked'>Locked</option>
                    </select>
                </div>

                <div>
                    <label className='block font-medium mb-1'>Position</label>
                    <input
                        type='text'
                        value={form.position}
                        onChange={(e) =>
                            setForm({ ...form, position: e.target.value })
                        }
                        className='w-full border px-3 py-2 rounded'
                        placeholder='Enter position'
                        required
                    />
                </div>

                <div>
                    <label className='block font-medium mb-1'>City</label>
                    <input
                        type='text'
                        value={form.city}
                        onChange={(e) =>
                            setForm({ ...form, city: e.target.value })
                        }
                        className='w-full border px-3 py-2 rounded'
                        placeholder='Enter city'
                        required
                    />
                </div>

                <button
                    type='submit'
                    className='bg-detail-yellow text-black py-2 rounded hover:bg-yellow-600 transition'
                >
                    {loading ? 'Updating...' : 'Update Bike'}
                </button>
            </form>
        </div>
    );
}
