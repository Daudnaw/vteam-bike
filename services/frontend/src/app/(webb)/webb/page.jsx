import { getSession } from '../../../../utils/user';
import { redirect } from 'next/navigation';

export default async function Page() {
    const session = await getSession();

    if (!session) {
        redirect('/webb/auth/login');
    }

    if (session.role == 'admin') {
        console.log("innei admin");
        redirect('/admin-dashboard');
    }

    if (session.role == 'customer') {
        redirect('/user-dashboard');
    }
}
