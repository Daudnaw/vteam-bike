import React from 'react';
import { User } from 'lucide-react';

export default function CustomerHeader({ email }) {
    return (
        <div className='w-full border-b-2 h-16 flex items-center justify-end pr-5 from-primary to-primary-dark bg-linear-to-br'>
            <User className='mr-2 text-detail-yellow' />
            <span className='text-white'>Hello, {email}</span>
        </div>
    );
}
