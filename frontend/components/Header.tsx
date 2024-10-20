import React from "react";
import Image from "next/image";
import ConnectWallet from "./ConnectWallet";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

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
  const pathname = usePathname();

  const showDashboardButton = isConnected && pathname !== "/dashboard";

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
        <div className="flex items-center space-x-4">
          {showDashboardButton && (
            <Link href="/dashboard">
              <Button className="bg-teal-500 hover:bg-teal-600 text-white">
                Dashboard
              </Button>
            </Link>
          )}
          <ConnectWallet
            isConnected={isConnected}
            onConnect={onConnect}
            onDisconnect={onDisconnect}
          />
        </div>
      </div>
    </header>
  );
}
