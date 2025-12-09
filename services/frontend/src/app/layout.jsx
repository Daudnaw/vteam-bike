import { Nunito_Sans, Playfair_Display } from 'next/font/google';
import './globals.css';

const nunito = Nunito_Sans({
    subsets: ['latin'],
    variable: '--font-nunito',
});

const playfair = Playfair_Display({
    subsets: ['latin'],
    variable: '--font-playfair',
});

// Global metadata
export const metadata = {
    title: 'Scooter app',
    description: 'Most awesome scooter app',
};

export default function RootLayout({ children }) {
    return (
        <html lang='en'>
            <body
                className={`${nunito.variable} ${playfair.variable} bg-background text-text`} //Global konfiguration
            >
                {children}
            </body>
        </html>
    );
}
