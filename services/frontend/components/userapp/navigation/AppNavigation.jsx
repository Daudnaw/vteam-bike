import React from 'react';
import Link from 'next/link';
import { Map, User, Camera, Bike } from 'lucide-react';

export default function AppNavigation() {
    return (
        <div className='fixed bottom-0 flex bg-slate-800 text-white py-5 w-full px-4 z-1000'>
            <Link
                className='border-r border-detail-yellow flex gap-2 flex-1 justify-center items-center pr-2'
                href='/'
            >
                <Camera className='text-detail-yellow' />
                <span>QR</span>
            </Link>
            <Link
                className='border-r flex gap-2 border-detail-yellow flex-1 justify-center items-center px-2'
                href='/app/user-app/map'
            >
                <Map className='text-detail-yellow' />
                <span>Karta</span>
            </Link>
            <Link
                className=' flex gap-2 flex-1 justify-center items-center pl-2'
                href='/app/user-app/profile'
            >
                <User className='text-detail-yellow' />
                <span>Profil</span>
            </Link>
        </div>
    );
}
