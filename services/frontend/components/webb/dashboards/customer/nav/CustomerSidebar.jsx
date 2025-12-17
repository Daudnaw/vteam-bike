'use client';
import React, { useState } from 'react';
import {
    Home,
    Bike,
    ArrowLeftCircle,
    Motorbike,
    Map,
    CreditCard,
    User,
} from 'lucide-react';
import NavLink from '../../shared/NavLink';
import SignOutButton from '../../shared/SignOutButton';

export default function CustomerSidebar() {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div
            className={`${
                collapsed ? 'w-[80px]' : 'w-[300px]'
            } p-5 bg-slate-800 h-screen relative transition-all ease-in-out duration-300 border-r border-background`}
        >
            <div className='flex gap-2 items-center'>
                <Bike className='text-detail-yellow h-14 w-14' />
                {!collapsed && <h2 className='text-h2 text-white'>Scooter</h2>}
            </div>
            <h4 className='text-base mt-10 text-detail-yellow'>Meny</h4>
            <NavLink
                link='/user-dashboard'
                collapsed={collapsed}
                text='Översikt'
                Icon={Home}
            />
            <NavLink
                link='/user-dashboard/trips'
                collapsed={collapsed}
                text='Resor'
                Icon={Motorbike}
            />
            <NavLink
                link='/user-dashboard/payment'
                collapsed={collapsed}
                text='Betalning'
                Icon={CreditCard}
            />
            <NavLink
                link='/user-dashboard/map'
                collapsed={collapsed}
                text='Karta'
                Icon={Map}
            />
            <NavLink
                link='/user-dashboard/profile'
                collapsed={collapsed}
                text='Profil'
                Icon={User}
            />
            <SignOutButton collapsed={collapsed} />
            <ArrowLeftCircle
                className={`${
                    collapsed && 'rotate-180'
                }  absolute right-0 -mr-4 top-2/4 bg-slate-800 h-8 w-8 rounded-full text-detail-yellow cursor-pointer`}
                onClick={() => setCollapsed(!collapsed)}
            />
        </div>
    );
}
