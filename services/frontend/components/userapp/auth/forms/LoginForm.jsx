'use client';
import React, { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { signinapp } from '../../../../src/app/actions/auth';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [viewPassword, setViewPassword] = useState(false);
    const router = useRouter();

    async function handleAction(formData) {
        try {
            setLoading(true);
            setError(null);
            const res = await signinapp(formData);

            if (res.ok) {
                toast.success(res.message, { autoClose: 1500 });
            }

            setTimeout(() => {
                router.push('/app/user-app');
            }, 1500);
        } catch (err) {
            setError(err);
        }
        setLoading(false);
    }

    return (
        <div className='w-md'>
            <form action={handleAction} className=''>
                <input
                    className='w-full bg-slate-200 p-2 rounded-md text-xl mt-3 h-14 border-detail border-2 text-black'
                    required={true}
                    placeholder='Email...'
                    name='email'
                    type='text'
                />

                <div className='flex justify-between items-center relative w-full'>
                    <input
                        className='w-full bg-slate-200 p-2 rounded-md text-xl mt-3 h-14 border-detail border-2 text-black'
                        required={true}
                        placeholder='Lösenord...'
                        name='password'
                        type={viewPassword ? 'text' : 'password'}
                    />

                    {viewPassword ? (
                        <EyeOff
                            onClick={() => {
                                setViewPassword(!viewPassword);
                            }}
                            className='absolute right-0 -mb-3 mr-2 hover:text-detail text-black cursor-pointer hover:text-detail-yellow'
                        />
                    ) : (
                        <Eye
                            onClick={() => {
                                setViewPassword(!viewPassword);
                            }}
                            className='absolute right-0 -mb-3 mr-2 hover:text-detail text-black cursor-pointer hover:text-detail-yellow'
                        />
                    )}
                </div>
                {error && (
                    <p className='mt-2 text-detail-red'>{error.message}</p>
                )}

                <div className='flex justify-between mt-5'>
                    <Link
                        href='/glomt-losenord'
                        className='underline hover:decoration-detail-yellow'
                    >
                        Glömt lösenord ?
                    </Link>
                    <Link
                        href='/app/auth/register'
                        className='underline hover:decoration-detail-yellow'
                    >
                        Inget konto? Bli medlem
                    </Link>
                </div>

                <button
                    type='submit'
                    className='bg-detail-yellow text-black rounded-md w-full text-h4 text-center mt-5 py-2 hover:opacity-90 cursor-pointer'
                >
                    {loading ? 'Loggar in...' : 'Logga in'}
                </button>
            </form>
        </div>
    );
}
