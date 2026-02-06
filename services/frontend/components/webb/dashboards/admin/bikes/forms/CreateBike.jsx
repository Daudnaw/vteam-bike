'use client';

import { useState } from 'react';
import { addBike } from '../../../../../../src/app/actions/bikes';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

/**
 * Create bike form for admin.
 * @returns
 */
export default function CreateBike() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();

    async function handleAction(formData) {
        try {
            setLoading(true);
            setError(null);

            const res = await addBike(formData);

            if (res.ok) {
                toast.success('Bike created successfully', { autoClose: 1500 });
            }

            setTimeout(() => {
                router.push('/admin-dashboard/bikes');
            }, 1500);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='w-md mx-auto border border-detail-yellow rounded-md p-6 shadow-xl from-slate-600 to-slate-800 bg-linear-to-br'>
            <h2 className='text-3xl text-white mb-6 text-center'>
                Create New Bike
            </h2>

            <form action={handleAction}>
                <select
                    name='bikeStatus'
                    required
                    className='w-full bg-slate-200 p-2 rounded-md text-xl mt-3 h-14 border-detail border-2 text-black'
                >
                    <option value=''>Select status</option>
                    <option value='available'>Tillgänglig</option>
                    <option value='offline'>Offline</option>
                </select>

                <input
                    className='w-full bg-slate-200 p-2 rounded-md text-xl mt-3 h-14 border-detail border-2 text-black'
                    required
                    placeholder='Battery level (%)'
                    name='batteryLevel'
                    type='number'
                    min='0'
                    max='100'
                />

                <input
                    className='w-full bg-slate-200 p-2 rounded-md text-xl mt-3 h-14 border-detail border-2 text-black'
                    required
                    placeholder='Latitude'
                    name='lat'
                    type='number'
                    step='any'
                />

                <input
                    className='w-full bg-slate-200 p-2 rounded-md text-xl mt-3 h-14 border-detail border-2 text-black'
                    required
                    placeholder='Longitude'
                    name='lon'
                    type='number'
                    step='any'
                />

                {error && (
                    <p className='mt-2 text-detail-red'>{error.message}</p>
                )}

                <button
                    type='submit'
                    className='bg-detail-yellow text-black rounded-md w-full text-h4 text-center mt-5 py-2 hover:opacity-90 cursor-pointer'
                >
                    {loading ? 'Creating bike...' : 'Create bike'}
                </button>
            </form>
        </div>
    );
}
