import React from 'react';
import Link from 'next/link';

export default function Page() {
    // Check if session is active, redirect to user/admin dashboard or login route is no session is active
    return (
        <div className='flex justify-center items-center h-screen flex-col gap-5'>
            <h1 className='text-h1'>Hello world!</h1>
            <Link href='/example' className='text-primary-dark text-h3'>
                To example page!
            </Link>
        </div>
    );
}
