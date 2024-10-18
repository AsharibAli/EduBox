import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import OCIDProvider from "../components/OCIDProvider";

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
      <body className={inter.className}>
        <OCIDProvider>{children}</OCIDProvider>
      </body>
    </html>
  );
}
