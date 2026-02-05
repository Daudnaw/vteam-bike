import React from 'react';

/**
 * Card component for user app.
 * @param {*} param0
 * @returns
 */
export default function IconCard({ Icon, text, amount }) {
    return (
        <div className='bg-slate-800 text-white rounded-xl shadow-xl p-4'>
            <div className='flex justify-center items-center flex-col'>
                <Icon className='text-detail-yellow' />
                <p className='mt-2 font-bold'>{amount}</p>
                <p className='mt-2 text-base'>{text}</p>
            </div>
        </div>
    );
}
