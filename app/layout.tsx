import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Tolet Board Chennai - 360° Property Tours",
    description: "Find your perfect property in Chennai with immersive 360° virtual tours. Rent & Lease options for Residential and Commercial properties.",
    manifest: "/manifest.json",
    themeColor: "#d4a017",
    viewport: "width=device-width, initial-scale=1, maximum-scale=5",
    icons: {
        icon: "/logo.png",
        apple: "/logo.png",
    },
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "Tolet Board Chennai",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>{children}</body>
        </html>
    );
}
