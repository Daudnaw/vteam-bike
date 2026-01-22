import React from 'react';
import { CreditCard } from 'lucide-react';

export default function CustomerProfile({
    firstName,
    lastName,
    email,
    verified,
}) {
    return (
        <div>
            <h3 className='my-5 text-h3'>Översikt</h3>
            <div className='from-slate-600 to-slate-800 bg-linear-to-br p-5 rounded-md shadow-2xl text-white'>
                <p className='mb-5'>
                    Förnamn:
                    <span className='font-bold text-detail-yellow'>
                        {firstName}
                    </span>
                </p>

                <p className='mb-5'>
                    Efternamn:
                    <span className='font-bold text-detail-yellow'>
                        {lastName}
                    </span>
                </p>

                <p className='mb-5'>
                    Email:{' '}
                    <span className='font-bold text-detail-yellow'>
                        {email}
                    </span>
                </p>

                {/* <p className='mb-5'>
                    Verifierad:
                    <span
                        className={`${
                            verified ? 'text-detail-mint' : 'text-detail-red'
                        } ml-2 font-bold`}
                    >
                        {verified ? 'Ja' : 'Nej'}
                    </span>
                </p> */}
            </div>

            <h3 className='my-5 text-h3'>Betalning</h3>

            <div className='from-slate-600 to-slate-800 bg-linear-to-br p-5 rounded-md shadow-2xl text-white'>
                <p className='mb-5'>
                    Kort:{' '}
                    <span className='font-bold text-detail-yellow'>1</span>
                </p>

                <div className='flex gap-2'>
                    <CreditCard className='text-detail-yellow' />
                    <p>**** **** **** **34</p>
                </div>
            </div>
        </div>
    );
}
