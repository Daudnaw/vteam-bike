import AdminHeader from '../../../../components/webb/dashboards/admin/nav/AdminHeader';
import AdminSidebar from '../../../../components/webb/dashboards/admin/nav/AdminSidebar';
import { getSession } from '../../../../utils/user';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }) {
    const session = await getSession();

    console.log('SEssion:', session);

    if (!session) {
        redirect('/webb/auth/login');
    }

    return (
        <section className='flex h-screen overflow-hidden'>
            <AdminSidebar />
            <main className='flex-1 overflow-y-scroll'>
                <AdminHeader
                    firstName={session.firstName}
                    lastName={session.lastName}
                />
                {children}
            </main>
        </section>
    );
}
