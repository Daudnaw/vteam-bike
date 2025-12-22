import { getSession } from '../../../../../utils/user';
import { redirect } from 'next/navigation';
import AppNavigation from '../../../../../components/userapp/navigation/AppNavigation';

export default async function UserAppLayout({ children }) {
    let session = await getSession();

    if (!session) {
        redirect('/app/auth/login');
    }

    return (
        <main className=''>
            {children} <AppNavigation />
        </main>
    );
}
