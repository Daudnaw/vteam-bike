import React from 'react';
import Image from 'next/image';
import RegisterForm from './forms/RegisterForm';

export default function RegisterPage() {
    return (
        <div className='h-screen flex'>
            <div className='flex-1 items-center justify-center flex flex-col'>
                <div className='bg-primary-light p-5 rounded-md shadow-2xl border-2 border-primary-dark'>
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
