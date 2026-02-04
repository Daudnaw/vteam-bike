import React from 'react';
import { User, Bike, Mail } from 'lucide-react';
import IconCard from './IconCard';
import SignOutButton from '../../webb/dashboards/shared/SignOutButton';

export default async function ProfilePage({ profile }) {
    return (
        <div className='p-4 mb-20'>
            <h2 className='text-center font-bold'>Profil</h2>
            <div className='flex justify-center mt-5'>
                <div className='rounded-full bg-slate-800 p-20 w-fit'>
                    <User className='text-detail-yellow h-16 w-16' />
                </div>
            </div>

            <div className='flex justify-center mt-5'>
                <p className='font-bold text-p'>
                    {profile.firstName} {profile.lastName}
                </p>
            </div>

            <p className='text-center text-gray-600 mt-5'>
                För att ändra din profil behöver du logga in på vår webb
                version.
            </p>

            <div className='grid grid-cols-3 gap-5 mt-5'>
                <IconCard Icon={Bike} amount={0} text='Resor' />
                <IconCard Icon={Bike} amount={0} text='Resor' />
                <IconCard Icon={Bike} amount={0} text='Resor' />
            </div>

            <div className='h-1 w-full bg-slate-800 my-4' />

            <div className='flex items-center gap-2 text-xl'>
                <Mail /> <span>{profile.email}</span>
            </div>

            <div className='h-1 w-full bg-slate-800 my-4' />

            <div className='flex items-center gap-2 text-xl my-4'>
                <SignOutButton collapsed={false} webb={false} />
            </div>
        </div>
    );
}
