import React from 'react';
import Image from 'next/image';
import RegisterForm from './forms/RegisterForm';

export default function RegisterPage() {
    return (
        <div className='h-screen flex'>
            <div className='flex-1 relative'>
                <Image alt='Scooters' src='/scooters-2.png' fill={true} />
            </div>
            <div className='flex-1 items-center justify-center flex flex-col'>
                <div className='bg-slate-800 p-5 rounded-md shadow-2xl text-white'>
                    <h2 className='text-4xl font-bold mb-5 text-center'>
                        Skapa konto!
                    </h2>
                    <p className='text-lg mb-5 text-center'>
                        Fyll i fälten nedan!
                    </p>
                    <RegisterForm />
                </div>
            </div>
        </div>
    );
}
