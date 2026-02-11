import type { Metadata } from 'next'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'Breezlist — Simple shared lists for everyone',
  description:
    'Stop texting lists back and forth. Create, share, and collaborate on lists in real-time — groceries, todos, packing, gifts, and more.',
  keywords: [
    'simple list app',
    'shared lists app',
    'shopping list app',
    'grocery list app',
    'collaborative lists',
    'todo list',
    'packing list',
  ],
  authors: [{ name: 'Breezlist' }],
  openGraph: {
    title: 'Breezlist — Simple shared lists for everyone',
    description:
      'Create, share, and collaborate on lists in real-time. Groceries, todos, packing, gifts, and more.',
    url: 'https://breezlist.com',
    siteName: 'Breezlist',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://breezlist.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Breezlist — Simple shared lists for everyone',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Breezlist — Simple shared lists for everyone',
    description:
      'Create, share, and collaborate on lists in real-time.',
    images: ['https://breezlist.com/og-image.png'],
  },
  metadataBase: new URL('https://breezlist.com'),
}

function ThemeScript() {
  const script = `
    (function() {
      var theme = localStorage.getItem('theme');
      if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
      }
    })();
  `
  return <script dangerouslySetInnerHTML={{ __html: script }} />
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'Breezlist',
              description:
                'Simple shared lists for everyone. Create, share, and collaborate in real-time.',
              url: 'https://app.breezlist.com',
              applicationCategory: 'ProductivityApplication',
              operatingSystem: 'Any',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
            }),
          }}
        />
      </head>
      <body className="min-h-screen bg-bg-primary text-text-primary antialiased">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
