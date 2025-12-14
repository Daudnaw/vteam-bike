import React from 'react';

export default function ToolTip({ text }) {
    return (
        <div className='absolute left-full top-1/2 -translate-y-1/2 ml-2 w-max bg-slate-800 text-white border-detail-yellow border rounded-md shadow-2xl z-50 p-2 text-base'>
            {text}
        </div>
    );
}
