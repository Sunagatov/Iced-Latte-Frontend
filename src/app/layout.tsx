import React from 'react';
import {Metadata} from 'next';
import {Inter} from 'next/font/google';
import {Header} from '../shares/header';
import './globals.css';

const inter = Inter({subsets: ['latin']});

export const metadata: Metadata = {
    title: 'Online store',
    description: 'Online store',
};

interface RootLayoutProps {
    children: React.ReactNode;
}

export default function RootLayout({children}: RootLayoutProps) {
    return (
        <html lang="en">
        <body className={inter.className}>
        <Header/>
        {children}
        </body>
        </html>
    );
}
