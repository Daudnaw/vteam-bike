'use client';
import React, { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { signin } from '../../../../src/app/actions/auth';
import Link from 'next/link';

export default function LoginForm() {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [viewPassword, setViewPassword] = useState(false);

    async function handleAction(formData) {
        try {
            setLoading(true);
            setError(null);
            const res = await signin(formData);
        } catch (err) {
            setError(err);
        }
        setLoading(false);
    }

    return (
        <div className='w-md'>
            <form action={handleAction} className=''>
                <input
                    className='w-full bg-gray-200 p-2 rounded-md text-xl mt-3 h-14 border-detail border-2'
                    required={true}
                    placeholder='Email...'
                    name='email'
                    type='text'
                />

                <div className='flex justify-between items-center relative w-full'>
                    <input
                        className='w-full bg-gray-200 p-2 rounded-md text-xl mt-3 h-14 border-detail border-2'
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
                            className='absolute right-0 -mb-3 mr-2 hover:text-detail cursor-pointer hover:text-detail-yellow'
                        />
                    ) : (
                        <Eye
                            onClick={() => {
                                setViewPassword(!viewPassword);
                            }}
                            className='absolute right-0 -mb-3 mr-2 hover:text-detail cursor-pointer hover:text-detail-yellow'
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
                        href='/skapa-konto'
                        className='underline hover:decoration-detail-yellow'
                    >
                        Inget konto? Bli medlem
                    </Link>
                </div>

                <button
                    type='submit'
                    className='bg-primary-dark text-white rounded-md w-full text-h4 text-center mt-5 py-2 hover:text-detail-yellow cursor-pointer'
                >
                    {loading ? 'Loggar in...' : 'Logga in'}
                </button>
            </form>
        </div>
    );
}
