import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-cisa-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://wjy012-cisa-review.onrender.com',
  ),
  title: 'CISA 弱点回顾',
  description: '基于个人薄弱知识地图的 CISA 知识回顾与错题重做工具。',
  openGraph: {
    title: 'CISA 弱点回顾',
    description: '把错题变成判断力：按薄弱模式复习、重做错题并查看完整解析。',
    type: 'website',
    locale: 'zh_CN',
    images: [{ url: '/og.png', width: 1672, height: 941, alt: 'CISA 弱点回顾' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CISA 弱点回顾',
    description: '把错题变成判断力：按薄弱模式复习、重做错题并查看完整解析。',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
