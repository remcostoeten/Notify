import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import '@remcostoeten/notifier/styles'

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin']
})

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin']
})

export const metadata: Metadata = {
    title: 'Notifier — chainable notifications for React',
    description:
        'Interactive docs and showcase for @remcostoeten/notifier: a chainable, Motion-animated notification system with a Sonner-like API.'
}

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang='en' className='dark' suppressHydrationWarning>
            <body
                className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground antialiased`}
            >
                <ThemeProvider attribute='class' forcedTheme='dark' disableTransitionOnChange>
                    {children}
                </ThemeProvider>
            </body>
        </html>
    )
}
