import React from 'react';

export default function StatCard({ nr, text }) {
    return (
        <div className='from-primary to-primary-dark bg-linear-to-br flex flex-col justify-center items-center p-5 rounded-md shadow-2xl w-full'>
            <span className='mb-5 text-h1 text-detail-yellow'>{nr}</span>
            <span className='text-h4 text-white'>{text}</span>
        </div>
    );
}
