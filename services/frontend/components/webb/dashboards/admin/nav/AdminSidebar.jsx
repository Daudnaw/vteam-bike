import React from 'react';
import { Home, Bike, LogOut } from 'lucide-react';
import Link from 'next/link';
import { signout } from '../../../../../src/app/actions/auth';

export default function AdminSidebar() {
    return (
        <div className='w-1/10 p-4 bg-primary h-screen border-r-2'>
            <div className='flex gap-2 items-center mt-2'>
                <Bike className='text-detail-yellow h-14 w-14' />
                <h2 className='text-h2'>Scooter</h2>
            </div>
            <h4 className='text-base mt-10'>Meny</h4>
            <Link
                href='/admin-dashboard'
                className='flex items-center text-h4 mt-4 py-2 group transition-colors ease-in-out duration-500 border-b-2'
            >
                <Home className='text-detail-yellow mr-2 h-8 w-8 transition-colors group-hover:text-primary-dark' />
                <span className='group-hover:text-primary-dark transition-colors'>
                    Länk 1
                </span>
            </Link>
            <Link
                href='/admin-dashboard'
                className='flex items-center text-h4 mt-4 py-2 group transition-colors ease-in-out duration-500 border-b-2'
            >
                <Home className='text-detail-yellow mr-2 h-8 w-8 transition-colors group-hover:text-primary-dark' />
                <span className='group-hover:text-primary-dark transition-colors'>
                    Länk 2
                </span>
            </Link>{' '}
            <Link
                href='/admin-dashboard'
                className='flex items-center text-h4 mt-4 py-2 group transition-colors ease-in-out duration-500 border-b-2'
            >
                <Home className='text-detail-yellow mr-2 h-8 w-8 transition-colors group-hover:text-primary-dark' />
                <span className='group-hover:text-primary-dark transition-colors'>
                    Länk 3
                </span>
            </Link>{' '}
            <Link
                href='/admin-dashboard'
                className='flex items-center text-h4 mt-4 py-2 group transition-colors ease-in-out duration-500 border-b-2'
            >
                <Home className='text-detail-yellow mr-2 h-8 w-8 transition-colors group-hover:text-primary-dark' />
                <span className='group-hover:text-primary-dark transition-colors'>
                    Länk 4
                </span>
            </Link>
            <form action={signout}>
                <button
                    type='submit'
                    className='bg-detail-red w-full py-2 rounded-md text-p cursor-pointer mt-4 hover:opacity-95 flex justify-center items-center'
                >
                    <LogOut className='pr-2' /> Logga ut
                </button>
            </form>
        </div>
    );
}
