import { redirect } from "next/navigation";
import CustomerProfile from "../../../../../../components/webb/dashboards/customer/CustomerProfile";
import { getSession } from "../../../../../../utils/user.server";

export default async function Page() {
    let session = await getSession();
    
    if (!session) {
        redirect('/webb/auth/login');
    }

    return (
        <div className='p-5'>
            <h2 className='text-h2 mb-5 font-bold'>Profil</h2>

            <CustomerProfile
                firstName={session.firstName}
                lastName={session.lastName}
                email={session.email}
                verified={false}
            />
        </div>
    );
}
