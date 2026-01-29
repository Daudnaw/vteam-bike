import { getSession } from '../../../../../../utils/user';
import PaymentsClient from './PaymentsClient';

export default async function Page() {
    const session = await getSession();
    return <PaymentsClient session={session} />;
}
