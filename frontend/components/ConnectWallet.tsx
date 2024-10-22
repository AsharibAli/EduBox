"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ethers } from 'ethers';

interface ConnectWalletProps {
  isConnected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

export default function ConnectWallet({
  isConnected,
  onConnect,
  onDisconnect,
}: ConnectWalletProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAction = async () => {
    setIsLoading(true);
    try {
      if (isConnected) {
        await onDisconnect();
        toast({
          title: "Wallet Disconnected",
          description: "Your wallet has been disconnected.",
          duration: 3000,
        });
      } else {
        // Explicitly request accounts to trigger MetaMask popup
        if (typeof window.ethereum !== 'undefined') {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const provider = new ethers.BrowserProvider(window.ethereum);
          await provider.send("eth_requestAccounts", []);
          await onConnect();
          toast({
            title: "Wallet Connected",
            description: "Your wallet has been successfully connected.",
            duration: 3000,
          });
        } else {
          throw new Error("MetaMask is not installed");
        }
      }
    } catch (error) {
      console.error("Wallet action failed:", error);
      toast({
        title: "Action Failed",
        description: isConnected
          ? "Failed to disconnect wallet."
          : "Failed to connect wallet. Make sure MetaMask is installed and unlocked.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleAction}
      disabled={isLoading}
      className="bg-teal-500 hover:bg-teal-600 text-white"
    >
      {isLoading
        ? "Processing..."
        : isConnected
        ? "Disconnect Wallet"
        : "Connect Wallet"}
    </Button>
  );
}
