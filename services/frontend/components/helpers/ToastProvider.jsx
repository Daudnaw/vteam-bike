'use client';
import React from 'react';
import { ToastContainer } from 'react-toastify';

/**
 * A toast provider.
 * @returns
 */
export default function ToastProvider() {
    return <ToastContainer position='bottom-right' autoClose={3000} />;
}
