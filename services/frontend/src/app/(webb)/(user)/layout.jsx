import CustomerSidebar from '../../../../components/webb/dashboards/customer/nav/CustomerSidebar';
import CustomerHeader from '../../../../components/webb/dashboards/customer/nav/CustomerHeader';
import { getSession } from '../../../../utils/user.server';
import { redirect } from 'next/navigation';

export default async function UserLayout({ children }) {
    let session = await getSession();

    if (!session) {
        redirect('/webb/auth/login');
    }

    return (
        <section className='flex'>
            <CustomerSidebar />
            <main className='flex-1'>
<<<<<<< HEAD
                
                <CustomerHeader email={session.email} />
=======
                <CustomerHeader firstName={session.firstName} lastName={session.lastName}/>
>>>>>>> main
                {children}
            </main>
        </section>
    );
}
