import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://toletboardchennai.com';

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    themeColor: '#d4a017',
};

export const metadata: Metadata = {
    metadataBase: new URL(siteUrl),
    title: {
        default: "Tolet Board Chennai - 360° Virtual Property Tours | Rent & Lease",
        template: "%s | Tolet Board Chennai",
    },
    description: "Find your perfect property in Chennai with immersive 360° virtual tours. Browse rental and lease options for residential and commercial properties across Chennai. Compare properties, view virtual tours, and contact owners directly.",
    manifest: "/manifest.json",
    keywords: [
        "tolet board chennai",
        "chennai property rent",
        "chennai property lease",
        "360 virtual tour chennai",
        "apartment rent chennai",
        "commercial property chennai",
        "office space chennai",
        "house rent chennai",
        "flat rent chennai",
        "property listing chennai",
        "virtual property tour",
        "no broker chennai",
        "tolet", "to let", "to-let",
    ],
    authors: [{ name: "Tolet Board Chennai" }],
    creator: "Tolet Board Chennai",
    publisher: "Tolet Board Chennai",
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    icons: {
        icon: "/logo.png",
        apple: "/logo.png",
    },
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "Tolet Board Chennai",
    },
    openGraph: {
        type: 'website',
        locale: 'en_IN',
        url: siteUrl,
        title: "Tolet Board Chennai - 360° Virtual Property Tours",
        description: "Find your perfect property in Chennai with immersive 360° virtual tours. Rent & Lease options for Residential and Commercial properties.",
        siteName: "Tolet Board Chennai",
        images: [{ url: `${siteUrl}/logo.png`, width: 512, height: 512, alt: "Tolet Board Chennai" }],
    },
    twitter: {
        card: 'summary_large_image',
        title: "Tolet Board Chennai - 360° Virtual Property Tours",
        description: "Find your perfect property in Chennai with immersive 360° virtual tours.",
        images: [`${siteUrl}/logo.png`],
    },
    alternates: {
        canonical: siteUrl,
    },
    verification: {
        // Add Google Search Console verification when available
        // google: 'your-verification-code',
    },
};

// Organization + WebSite JSON-LD for global SEO / AI discovery
const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: 'Tolet Board Chennai',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    description: 'Premier property listing platform in Chennai offering 360° virtual tours for rental and lease properties.',
    address: {
        '@type': 'PostalAddress',
        addressLocality: 'Chennai',
        addressRegion: 'Tamil Nadu',
        addressCountry: 'IN',
    },
    areaServed: {
        '@type': 'City',
        name: 'Chennai',
    },
    sameAs: [],
};

const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Tolet Board Chennai',
    url: siteUrl,
    description: 'Find rental and lease properties in Chennai with 360° virtual tours.',
    potentialAction: {
        '@type': 'SearchAction',
        target: {
            '@type': 'EntryPoint',
            urlTemplate: `${siteUrl}/list?search={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
                />
            </head>
            <body className={inter.className}>{children}</body>
        </html>
    );
}
