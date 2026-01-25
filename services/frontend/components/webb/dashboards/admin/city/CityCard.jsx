import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function CityCard({ name, id }) {
    return (
        <Link href={`/admin-dashboard/cities/update?cityId=${id}`}>
            <div className=' rounded-md from-slate-600 to-slate-800 bg-linear-to-br h-[300px] w-[400px] group'>
                <div className='relative w-full h-4/5'>
                    <Image
                        className='rounded-t-md'
                        src='/city.png'
                        alt='City'
                        fill={true}
                    />
                </div>
                <h2 className='text-white text-h3 font-semibold text-center my-2 group-hover:text-detail-yellow'>
                    {name}
                </h2>
            </div>
        </Link>
    );
}
