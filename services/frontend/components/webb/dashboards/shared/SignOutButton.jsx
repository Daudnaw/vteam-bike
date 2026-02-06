import React from 'react';
import { signout, signoutapp } from '../../../../src/app/actions/auth';
import { LogOut } from 'lucide-react';

/**
 * Sign out button in dashboard.
 * @param {*} param0
 * @returns
 */
export default function SignOutButton({ collapsed, webb }) {
    return (
        <form action={webb ? signout : signoutapp}>
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
