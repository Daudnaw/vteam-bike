import React from 'react';
import Image from 'next/image';
import LoginForm from './forms/LoginForm';

export default function Login() {
    return (
        <div className='h-screen flex'>
            <div className='flex-1 relative'>
                <Image alt='Scooters' src='/scooters-2.png' fill={true} />
            </div>
            <div className='flex-1 items-center justify-center flex flex-col'>
                <div className='bg-primary-light p-5 rounded-md shadow-2xl border-2 border-primary-dark'>
                    <h2 className='text-4xl font-bold mb-5 text-center'>
                        Hej igen!
                    </h2>
                    <p className='text-lg mb-5 text-center'>
                        Välkommen tillbaka, vänligen logga in!
                    </p>
                    <LoginForm />
                </div>
            </div>
        </div>
    );
}
