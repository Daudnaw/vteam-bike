import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Page() {
    return (
        <div className='flex justify-center items-center h-screen relative'>
            <Image
                src='/scooters.png'
                alt='Scooters'
                fill={true}
                className='opacity-10'
            />
            <div className='flex flex-col w-xl bg-slate-800 p-5 rounded-md shadow-2xl z-10 text-white'>
                <h1 className='text-h1 text-center font-bold'>Välkommen</h1>
                <p className='text-p mt-5 text-center'>
                    Välj det alternativ som passar dig bäst!
                </p>
                <div className='flex mt-5 items-center gap-5 w-full'>
                    <Link
                        href='/app'
                        className='bg-detail-yellow text-black py-4 px-8 text-h4 font-bold  rounded-md flex-1 text-center hover:opacity-90'
                    >
                        Användarapp
                    </Link>
                    <Link
                        href='/webb'
                        className='bg-detail-yellow text-black py-4 px-8 text-h4 font-bold rounded-md flex-1 text-center hover:opacity-90'
                    >
                        Webbapp
                    </Link>
                </div>
            </div>
        </div>
    );
}
