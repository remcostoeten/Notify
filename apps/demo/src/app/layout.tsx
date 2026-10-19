import type { Metadata } from 'next'
import { Geist, Geist_Mono, Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin']
})

const inter = Inter({
    variable: '--font-inter',
    subsets: ['latin']
})

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin']
})

export const metadata: Metadata = {
    title: 'Notifier: composable toasts for React',
    description:
        'Interactive docs and showcase for @remcostoeten/notifier: toasts built from slots and primitives, with light and dark tones and Motion animation.'
}

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang='en' className='dark' suppressHydrationWarning>
            <body
                className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} bg-background text-foreground antialiased`}
            >
                <ThemeProvider attribute='class' forcedTheme='dark' disableTransitionOnChange>
                    {children}
                </ThemeProvider>
            </body>
        </html>
    )
}
