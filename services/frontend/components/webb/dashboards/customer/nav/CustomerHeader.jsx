import React from 'react';
import { User } from 'lucide-react';

/**
 * Customer header in dashboard.
 * @param {*} param0
 * @returns
 */
export default function CustomerHeader({ firstName, lastName }) {
    return (
        <div className='w-full border-b h-12 flex items-center justify-end pr-5 bg-slate-800'>
            <User className='mr-2 text-detail-yellow' />
            <span className='text-white'>
                Hej, {firstName} {lastName}
            </span>
        </div>
    );
}
