import { getSession } from '../../../../utils/user';
import { redirect } from 'next/navigation';

export default async function Page() {
    const session = await getSession();

    if (!session) {
        redirect('/webb/auth/login');
    }

    // TODO: Check user role and redirect to correct dashboard
}
