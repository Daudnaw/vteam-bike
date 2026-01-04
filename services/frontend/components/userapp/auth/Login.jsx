import React from 'react';
import LoginForm from './forms/LoginForm';
import Image from 'next/image';

export default function Login() {
    return (
        <div className='h-screen p-5'>
            <h2 className='text-center font-bold'>Scooter app</h2>
            <div className='relative h-[200px] rounded-lg mt-5 shadow-xl'>
                <Image
                    className='rounded-lg shadow-xl'
                    src='/scooters.png'
                    alt='Scooters'
                    fill={true}
                />
            </div>

            <h3 className='mt-5 text-center text-h3 font-bold'>
                Välkommen tillbaka
            </h3>

            <p className='text-sm text-center text-gray-500 mt-2'>
                Vänligen logga in för att fortsätta din upplevelse med att hyra
                cyklar.
            </p>

            <LoginForm />
        </div>
    );
}
