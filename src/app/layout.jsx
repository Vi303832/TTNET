import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const viewport = {
  themeColor: '#f4f1ea',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata = {
  title: 'Token Track (TT²) — TürkTicaret.net Staj Projesi',
  description: 'TürkTicaret.net bünyesinde geliştirilen Token Track (TT²); Google Gemini 3.8 Flash çekirdeği, anlık yanıt akışı ve mikro token maliyet takibi sağlayan yapay zekâ uygulaması.',
  keywords: ['Token Track', 'TT²', 'TürkTicaret.net', 'Gemini 3.8 Flash', 'Token Cost Tracker', 'Staj Projesi'],
  authors: [{ name: 'TürkTicaret.net' }],
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body className="bg-paper text-ink antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
