import React from 'react';
import Link from 'next/link';

export default async function Page({ params }) {
    const { id } = await params;
    return (
        <div className='h-screen flex items-center justify-center'>
            <div className='h-[400px] w-[600px] bg-primary rounded-md p-5 shadow-2xl border-4 border-detail-mint'>
                <Link href='/example'>Back</Link>
                <h1 className=' text-h4 font-bold'>
                    From params:{' '}
                    <span className='text-detail-yellow'>{id}</span>
                </h1>
            </div>
        </div>
    );
}
