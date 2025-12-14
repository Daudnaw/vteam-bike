'use client';
import React, { useState } from 'react';
import { Home, Bike, ArrowLeftCircle } from 'lucide-react';
import NavLink from '../../shared/NavLink';
import SignOutButton from '../../shared/SignOutButton';

export default function CustomerSidebar() {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div
            className={`${
                collapsed ? 'w-[80px]' : 'w-[300px]'
            } p-5 from-primary to-primary-dark bg-linear-to-br h-screen border-r-2 relative transition-all ease-in-out duration-300`}
        >
            <div className='flex gap-2 items-center mt-2'>
                <Bike className='text-detail-yellow h-14 w-14' />
                {!collapsed && <h2 className='text-h2'>Scooter</h2>}
            </div>
            <h4 className='text-base mt-10 text-detail-yellow'>Meny</h4>
            <NavLink
                link='/user-dashboard'
                collapsed={collapsed}
                text='Länk 1'
                Icon={Home}
            />
            <NavLink
                link='/user-dashboard'
                collapsed={collapsed}
                text='Länk 2'
                Icon={Home}
            />
            <NavLink
                link='/user-dashboard'
                collapsed={collapsed}
                text='Länk 3'
                Icon={Home}
            />
            <NavLink
                link='/user-dashboard'
                collapsed={collapsed}
                text='Länk 4'
                Icon={Home}
            />
            <SignOutButton collapsed={collapsed} />
            <ArrowLeftCircle
                className={`${
                    collapsed && 'rotate-180'
                }  absolute right-0 -mr-4 top-2/4 bg-primary-dark h-8 w-8 rounded-full text-detail-yellow cursor-pointer`}
                onClick={() => setCollapsed(!collapsed)}
            />
        </div>
    );
}
