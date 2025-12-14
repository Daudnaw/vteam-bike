import React from 'react';
import { signout } from '../../../../src/app/actions/auth';
import { LogOut } from 'lucide-react';

export default function SignOutButton({ collapsed }) {
    return (
        <form action={signout}>
            <button
                type='submit'
                className='bg-detail-red w-full py-2 rounded-md text-p cursor-pointer mt-4 hover:opacity-95 flex justify-center items-center'
            >
                <LogOut className={`${!collapsed ? 'pr-2' : ''}`} />
                {!collapsed && <span>Logga ut</span>}
            </button>
        </form>
    );
}
