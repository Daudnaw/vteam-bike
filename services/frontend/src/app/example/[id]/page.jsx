import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function Page({ params }) {
    const { id } = await params;
    return (
        <div className='h-screen flex items-center justify-center'>
            <div className='h-[400px] w-[600px] bg-primary rounded-md p-5 shadow-2xl border-4 border-detail-mint'>
                <Link
                    href='/example'
                    className='flex gap-2 items-center hover:text-detail-yellow'
                >
                    <ArrowLeft /> Back
                </Link>
                <h1 className=' text-h4 font-bold mt-10'>
                    From params:{' '}
                    <span className='text-detail-yellow'>{id}</span>
                </h1>
            </div>
        </div>
    );
}
