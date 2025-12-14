import React from 'react';
import { signout } from '../../../../src/app/actions/auth';
import { LogOut } from 'lucide-react';

export default function SignOutButton({ collapsed }) {
    return (
        <form action={signout}>
            <button
                type='submit'
                className=' text-detail-red flex items-center text-h4 cursor-pointer mt-5 justify-center w-full'
            >
                <LogOut className={`${!collapsed ? 'pr-2' : ''}`} />
                {!collapsed && <span>Logga ut</span>}
            </button>
        </form>
    );
}
