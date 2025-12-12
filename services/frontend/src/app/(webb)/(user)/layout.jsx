import CustomerSidebar from '../../../../components/webb/dashboards/customer/nav/CustomerSidebar';
import CustomerHeader from '../../../../components/webb/dashboards/customer/nav/CustomerHeader';
import { getSession } from '../../../../utils/user';
import { redirect } from 'next/navigation';

export default async function UserLayout({ children }) {
    const session = await getSession();

    if (!session) {
        redirect('/webb/auth/login');
    }

    return (
        <section className='flex'>
            <CustomerSidebar />
            <main className='flex-1'>
                <CustomerHeader email={session.email} />
                {children}
            </main>
        </section>
    );
}
