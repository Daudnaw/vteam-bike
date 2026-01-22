'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OAuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.replace('#', ''));
    const token = params.get('token');

    if (!token) {
      router.replace('/webb/auth/login');
      return;
    }

    localStorage.setItem('token', token);

    router.replace('/user-dashboard');
  }, [router]);

  return <div className="p-6">Loggar in…</div>;
}