import React from "react";
import Image from "next/image";
import ConnectWallet from "./ConnectWallet";
import Link from "next/link";

interface HeaderProps {
  isConnected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

export default function Header({
  isConnected,
  onConnect,
  onDisconnect,
}: HeaderProps) {
  return (
    <header className="bg-white shadow-md p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Image
            src="/eduhub.webp"
            alt="EduHub Logo"
            className="h-8 w-8 mr-2"
            width={100}
            height={100}
          />
          <Link href="/">
            <span className="text-3xl font-bold text-teal-600">EduBox</span>
          </Link>
        </div>
        <ConnectWallet
          isConnected={isConnected}
          onConnect={onConnect}
          onDisconnect={onDisconnect}
        />
      </div>
    </header>
  );
}
