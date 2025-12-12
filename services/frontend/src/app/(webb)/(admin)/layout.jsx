export default function AdminLayout({ children }) {
    return (
        <section>
            <aside>Admin menu</aside>
            <main>{children}</main>
        </section>
    );
}
