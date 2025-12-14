import React from 'react';
import { User } from 'lucide-react';

export default function CustomerHeader({ email }) {
    return (
        <div className='w-full border-b h-12 flex items-center justify-end pr-5 bg-slate-800'>
            <User className='mr-2 text-detail-yellow' />
            <span className='text-white'>Hej, {email}</span>
        </div>
    );
}
