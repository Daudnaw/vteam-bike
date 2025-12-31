import AdminHeader from '../../../../components/webb/dashboards/admin/nav/AdminHeader';
import AdminSidebar from '../../../../components/webb/dashboards/admin/nav/AdminSidebar';
import { getSession } from '../../../../utils/user';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }) {
    const session = await getSession();

    if (!session) {
        redirect('/webb/auth/login');
    }  

    return (
        <section className='flex'>
            <AdminSidebar />
            <main className='flex-1'>
                <AdminHeader email={email} />
                {children}
            </main>
        </section>
    );
}
