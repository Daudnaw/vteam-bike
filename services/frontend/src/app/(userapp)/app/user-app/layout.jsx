import { getSession } from '../../../../../utils/user.server';
import { redirect } from 'next/navigation';
import AppNavigation from '../../../../../components/userapp/navigation/AppNavigation';

export default async function UserAppLayout({ children }) {
    let session = await getSession();

    if (!session) {
        redirect('/app/user-app/map');
    }

    return (
        <main className=''>
            {children} <AppNavigation />
        </main>
    );
}
