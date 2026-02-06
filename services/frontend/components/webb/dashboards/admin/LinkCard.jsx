import React from 'react';
import Link from 'next/link';

/**
 * Link card to use.
 * @param {*} param0
 * @returns
 */
export default function LinkCard({ to, text }) {
    return (
        <Link href={to}>
            <div className='from-slate-600 to-slate-800 bg-linear-to-br rounded-md shadow-2xl p-5 flex justify-center items-center text-white border-detail-yellow border hover:text-detail-yellow'>
                <p>{text}</p>
            </div>
        </Link>
    );
}
