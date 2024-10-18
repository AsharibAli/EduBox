"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import Web3 from "web3";

const ConnectWallet: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [accountAddress, setAccountAddress] = useState<string | undefined>(
    undefined
  );
  const { toast } = useToast();

  const switchToOpenCampusNetwork = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0xa045c" }],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: "0xa045c",
                  chainName: "Open Campus Codex",
                  nativeCurrency: {
                    name: "EDU",
                    symbol: "EDU",
                    decimals: 18,
                  },
                  rpcUrls: ["https://rpc.open-campus-codex.gelato.digital"],
                  blockExplorerUrls: [
                    "https://opencampus-codex.blockscout.com/",
                  ],
                },
              ],
            });
          } catch (addError) {
            console.error("Failed to add Open Campus Codex network:", addError);
          }
        } else {
          console.error(
            "Failed to switch to Open Campus Codex network:",
            switchError
          );
        }
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        await switchToOpenCampusNetwork();

        const chainId = await window.ethereum.request({
          method: "eth_chainId",
        });

        if (chainId !== "0xa045c") {
          toast({
            title: "Network Error",
            description:
              "Please connect to the Open Campus Codex network in MetaMask.",
            variant: "destructive",
          });
          return;
        }

        await window.ethereum.request({ method: "eth_requestAccounts" });
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        setAccountAddress(accounts[0]);
        setIsConnected(true);
        toast({
          title: "Wallet Connected",
          description: "Your wallet has been successfully connected!",
        });
      } catch (error) {
        console.error("Failed to connect to wallet:", error);
        toast({
          title: "Connection Error",
          description: "Failed to connect to wallet. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "MetaMask Not Found",
        description: "Please install MetaMask to use this feature.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window.ethereum !== "undefined") {
        const web3 = new Web3(window.ethereum);
        const accounts = await web3.eth.getAccounts();
        if (accounts.length > 0) {
          setIsConnected(true);
          setAccountAddress(accounts[0]);
        }
      }
    };

    checkConnection();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {!isConnected ? (
        <Button onClick={connectWallet}>Connect Wallet</Button>
      ) : (
        <div className="text-center">
          <p className="mb-2">Connected: {accountAddress}</p>
          <Button onClick={() => setIsConnected(false)}>Disconnect</Button>
        </div>
      )}
    </div>
  );
};

export default ConnectWallet;
