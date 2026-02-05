'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { register } from '../../../../../../src/app/actions/auth';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

/**
 * Create a new user.
 * @returns
 */
export default function CreateUser() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [viewPassword, setViewPassword] = useState(false);
    const router = useRouter();

    async function handleAction(formData) {
        try {
            setLoading(true);
            setError(null);

            const res = await register(formData);

            if (res.ok) {
                toast.success('User created successfully', { autoClose: 1500 });
            }

            setTimeout(() => {
                router.push('/admin-dashboard/customers');
            }, 1500);
        } catch (err) {
            setError(err);
        }
        setLoading(false);
    }

    return (
        <div className='w-md mx-auto border border-detail-yellow rounded-md p-6 shadow-xl from-slate-600 to-slate-800 bg-linear-to-br'>
            <h2 className='text-3xl text-white mb-6 text-center'>
                Skapa nytt konto
            </h2>

            <form action={handleAction}>
                <input
                    className='w-full bg-slate-200 p-2 rounded-md text-xl mt-3 h-14 border-detail border-2 text-black'
                    required
                    placeholder='Förnamn...'
                    name='firstName'
                    type='text'
                />

                <input
                    className='w-full bg-slate-200 p-2 rounded-md text-xl mt-3 h-14 border-detail border-2 text-black'
                    required
                    placeholder='Efternamn...'
                    name='lastName'
                    type='text'
                />

                <input
                    className='w-full bg-slate-200 p-2 rounded-md text-xl mt-3 h-14 border-detail border-2 text-black'
                    required
                    placeholder='Email...'
                    name='email'
                    type='email'
                />

                <div className='flex justify-between items-center relative w-full'>
                    <input
                        className='w-full bg-slate-200 p-2 rounded-md text-xl mt-3 h-14 border-detail border-2 text-black'
                        required
                        placeholder='Lösenord...'
                        name='password'
                        type={viewPassword ? 'text' : 'password'}
                    />

                    {viewPassword ? (
                        <EyeOff
                            onClick={() => setViewPassword(false)}
                            className='absolute right-0 -mb-3 mr-2 cursor-pointer text-black hover:text-detail-yellow'
                        />
                    ) : (
                        <Eye
                            onClick={() => setViewPassword(true)}
                            className='absolute right-0 -mb-3 mr-2 cursor-pointer text-black hover:text-detail-yellow'
                        />
                    )}
                </div>

                {error && (
                    <p className='mt-2 text-detail-red'>{error.message}</p>
                )}

                <button
                    type='submit'
                    className='bg-detail-yellow text-black rounded-md w-full text-h4 text-center mt-5 py-2 hover:opacity-90 cursor-pointer'
                >
                    {loading ? 'Skapar konto...' : 'Skapa konto'}
                </button>
            </form>
        </div>
    );
}
