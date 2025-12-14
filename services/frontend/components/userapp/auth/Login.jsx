import React from 'react';
import LoginForm from './forms/LoginForm';

export default function Login() {
    return (
        <div className='h-screen flex justify-center items-center'>
            <div className='bg-slate-800 p-5 rounded-md shadow-2xl text-white'>
                <h2 className='text-4xl font-bold mb-5 text-center'>
                    Hej igen!
                </h2>
                <p className='text-lg mb-5 text-center'>
                    Välkommen tillbaka, vänligen logga in!
                </p>
                <LoginForm />
            </div>
        </div>
    );
}
