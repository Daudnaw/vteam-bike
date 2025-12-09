export default function UserLayout({ children }) {
    return (
        <section>
            <aside>User menu</aside>
            <main>{children}</main>
        </section>
    );
}
