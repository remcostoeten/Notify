import type { Metadata } from 'next'

import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
    title: {
        default: 'Notifier - Type-safe React Notifications',
        template: '%s | Notifier'
    },
    description:
        'A headless, enterprise-grade notification system for React. Features smooth animations, promise tracking, chainable API, and full TypeScript support.',
    authors: [{ name: 'Remco Stoeten', url: 'https://remcostoeten.com' }],
    creator: 'Remco Stoeten',
    keywords: [
        'react',
        'notification',
        'toast',
        'alert',
        'typescript',
        'framer-motion',
        'headless',
        'accessible',
        'component-library'
    ],
    metadataBase: new URL('https://notifier.remcostoeten.com'), // Replace with actual URL if known, or localhost for now
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: 'https://notifier.remcostoeten.com',
        title: 'Notifier - Type-safe React Notifications',
        description:
            'Enterprise-grade chainable notification system for React with smooth animations, confirmations, and promise tracking.',
        siteName: 'Notifier',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'Notifier Library Preview'
            }
        ]
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Notifier - Type-safe React Notifications',
        description:
            'Enterprise-grade chainable notification system for React with smooth animations and promise tracking.',
        creator: '@remcostoeten',
        images: ['/og-image.png']
    },
    icons: {
        icon: [
            { url: '/favicon.png' },
            { url: '/logo.png', type: 'image/png' }
        ],
        shortcut: '/favicon.png',
        apple: '/logo.png', // Ideally should be 180x180, using mainly logo for now
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1
        }
    }
}

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang='en' className='dark'>
            <body className={`font-sans antialiased`}>
                {children}
                <Analytics />
            </body>
        </html>
    )
}
