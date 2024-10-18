import React from 'react';
import Link from 'next/link';
import WalletConnect from './WalletConnect';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground py-4">
        <nav className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            EduBox
          </Link>
          <div className="space-x-4">
            <Link href="/deploy-token" className="hover:text-accent-foreground">
              Deploy Token
            </Link>
            <Link href="/deploy-nft" className="hover:text-accent-foreground">
              Deploy NFT
            </Link>
            <Link href="/history" className="hover:text-accent-foreground">
              History
            </Link>
            <Link href="/support" className="hover:text-accent-foreground">
              Support
            </Link>
            <WalletConnect />
          </div>
        </nav>
      </header>
      <main className="container mx-auto py-8">{children}</main>
      <footer className="bg-muted text-muted-foreground py-4">
        <div className="container mx-auto text-center">
          © 2023 EduBox. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Layout;
