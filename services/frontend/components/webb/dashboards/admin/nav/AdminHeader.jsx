import React from 'react';
import { User } from 'lucide-react';

export default function AdminHeader({ email }) {
    return (
        <div className='w-full border-b-2 h-10 flex items-center justify-end pr-5 bg-primary'>
            <User className='mr-2 text-primary-dark' />
            <span>Hello, {email}</span>
        </div>
    );
}
