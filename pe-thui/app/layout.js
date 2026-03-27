import { Plus_Jakarta_Sans, Be_Vietnam_Pro } from 'next/font/google';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({ 
  subsets: ['vietnamese'], 
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta'
});

const beVietnam = Be_Vietnam_Pro({ 
  subsets: ['vietnamese'], 
  weight: ['400', '500', '600', '700'],
  variable: '--font-be-vietnam'
});

export const metadata = {
  title: 'Pe Thúi Tracker',
  description: 'Trợ lý theo dõi phát triển của bé',
  icons: {
    icon: '/Logoo.png',
    shortcut: '/Logoo.png',
    apple: '/Logoo.png',
    other: [
      { rel: 'apple-touch-icon', url: '/Logoo.png' },
      { rel: 'shortcut icon', url: '/Logoo.png' }
    ]
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi" className={`${plusJakarta.variable} ${beVietnam.variable}`}>
        <head>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
        </head>
        <body className="font-body">
        <main className="min-h-screen max-w-md mx-auto bg-background shadow-2xl relative">
          {children}
        </main>
      </body>
    </html>
  );
}

