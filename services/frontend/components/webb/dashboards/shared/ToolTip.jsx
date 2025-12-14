import React from 'react';

export default function ToolTip({ text }) {
    return (
        <div className='w-fit bg-primary-light rounded-md shadow-2xl absolute right-0 -mr-[70px] z-50 p-2 text-base border-2 border-detail-yellow'>
            {text}
        </div>
    );
}
