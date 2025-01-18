import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import OCIDProvider from "../components/OCIDProvider";
import Script from "next/script";
import Banner from "@/components/Banner";
import { BannerProvider } from "@/components/BannerContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "EduBox | No-Code Tool for EduChain",
  description:
    "A no-code tool to configure and deploy your Tokens and NFTs with one click on EduChain.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-THTQTN90XW"
      ></Script>
      <Script id="google-analytics">
        {`
   window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-THTQTN90XW');
  `}
      </Script>
      <body className={inter.className}>
        <BannerProvider>
          <Banner />
          <OCIDProvider>
          {children}
          </OCIDProvider>
        </BannerProvider>
      </body>
    </html>
  );
}
