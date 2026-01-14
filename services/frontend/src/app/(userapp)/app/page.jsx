import { getSession } from '../../../../utils/user';
import { redirect } from 'next/navigation';

export default async function Page() {
    const session = await getSession();

    if (!session) {
        redirect('/app/auth/login');
    }

    redirect('/app/user-app/map');
}
