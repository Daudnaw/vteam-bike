import React from 'react';
import Link from 'next/link';

export default function ExamplePage() {
    return (
        <div className='flex h-screen items-center justify-center flex-col gap-5'>
            <h1 className='text-h1'>Example page - Test dynamic pages below</h1>
            <div className='flex gap-5'>
                <Link
                    href='/example/lorem'
                    className='text-primary text-h3 hover:text-primary-dark'
                >
                    Lorem
                </Link>
                <Link
                    href='/example/ipsum'
                    className='text-primary text-h3 hover:text-primary-dark'
                >
                    Ipsum
                </Link>
                <Link
                    href='/example/dolar'
                    className='text-primary text-h3 hover:text-primary-dark'
                >
                    Dolar
                </Link>
            </div>
        </div>
    );
}
