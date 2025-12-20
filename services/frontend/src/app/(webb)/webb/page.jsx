import { getSession } from '../../../../utils/user';
import { redirect } from 'next/navigation';

export default async function Page() {
    let session = await getSession();

    session = {
    email: 'nz@gmail.com',
    password: '123456',
    role: 'admin'
};

console.log('ROLE:', session.role); // syns i terminalen

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
