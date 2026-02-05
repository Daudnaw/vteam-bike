import React from 'react';
import Link from 'next/link';
import ToolTip from './ToolTip';
import { useState } from 'react';

/**
 * Link in dashboard navigation.
 * @param {*} param0
 * @returns
 */
export default function NavLink({ collapsed, Icon, link, text }) {
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <Link
            href={link}
            className={`flex items-center text-h4 mt-4 py-2 group transition-colors ease-in-out duration-500 relative`}
        >
            <div
                onMouseEnter={() => {
                    if (collapsed) {
                        setShowTooltip(true);
                    }
                }}
                onMouseLeave={() => {
                    if (collapsed) {
                        setShowTooltip(false);
                    }
                }}
                className='relative'
            >
                <Icon
                    className={`${
                        !collapsed
                            ? 'mr-2 w-8'
                            : 'w-full group-hover:opacity-80'
                    } text-detail-yellow h-8 transition-colors`}
                />
            </div>
            {!collapsed && (
                <span className='group-hover:text-detail-yellow text-white transition-colors'>
                    {text}
                </span>
            )}

            {showTooltip && <ToolTip text={text} />}
        </Link>
    );
}
