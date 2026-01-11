import AdminHeader from '../../../../components/webb/dashboards/admin/nav/AdminHeader';
import AdminSidebar from '../../../../components/webb/dashboards/admin/nav/AdminSidebar';
import { getSession } from '../../../../utils/user.server';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }) {
    const session = await getSession();

    console.log('SEssion:', session);

    if (!session) {
        redirect('/webb/auth/login');
    }

    if (session.role !== "admin") {
        redirect('/user-dashboard');
    }

    return (
        <section className='flex'>
            <AdminSidebar />
            <main className='flex-1'>
                <AdminHeader email={session.email} />
                {children}
            </main>
        </section>
    );
}
