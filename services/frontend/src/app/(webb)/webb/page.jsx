import { getSession } from '../../../../utils/user';
import { redirect } from 'next/navigation';

export default async function Page() {
    const session = await getSession();

    if (!session) {
        redirect('/webb/auth/login');
    }

    if (session.role == 'customer') {
        redirect('/user-dashboard');
    }

    if (session.role == 'admin') {
        redirect('/admin-dashboard');
    }
}
