"use client";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ConnectWallet from "@/components/ConnectWallet";
import { FaTwitter, FaGithub, FaTelegram } from "react-icons/fa";
import Image from "next/image";
import { useState, useEffect } from "react";
import Web3 from "web3";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [accountAddress, setAccountAddress] = useState("");
  const [balance, setBalance] = useState("");

  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const web3 = new Web3(window.ethereum);
        const accounts = await web3.eth.getAccounts();
        if (accounts.length > 0) {
          setIsConnected(true);
          setAccountAddress(accounts[0]);
          const balanceWei = await web3.eth.getBalance(accounts[0]);
          const balanceEth = web3.utils.fromWei(balanceWei, "ether");
          setBalance(parseFloat(balanceEth).toFixed(4));
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error);
      }
    }
  };

  const disconnectWallet = async () => {
    setIsConnected(false);
    setAccountAddress("");
    setBalance("");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        isConnected={isConnected}
        onConnect={checkWalletConnection}
        onDisconnect={disconnectWallet}
      />

      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-4 text-teal-800">
          EduBox | No-Code Tool
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Configure and deploy your Tokens and NFTs with one click on EduChain.
        </p>

        {isConnected && (
          <div className="text-center mb-8">
            <p className="text-sm text-gray-600">
              <strong> Wallet Address:</strong> {accountAddress}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Balance:</strong> {balance} EDU
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-teal-700">
                Deploy ERC20 Token
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-gray-600">
                Create your own ERC20 token with customizable parameters.
              </p>
              {isConnected ? (
                <Link href="/deploy-token" passHref>
                  <Button className="w-full bg-teal-500 hover:bg-teal-600 text-white">
                    Deploy Token
                  </Button>
                </Link>
              ) : (
                <Button
                  className="w-full bg-gray-300 text-gray-500 cursor-not-allowed"
                  disabled
                >
                  Connect Wallet to Deploy
                </Button>
              )}
            </CardContent>
          </Card>
          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-teal-700">
                Deploy ERC721 NFT
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-gray-600">
                Create your own NFT collection with customizable metadata.
              </p>
              {isConnected ? (
                <Link href="/deploy-nft" passHref>
                  <Button className="w-full bg-teal-500 hover:bg-teal-600 text-white">
                    Deploy NFT
                  </Button>
                </Link>
              ) : (
                <Button
                  className="w-full bg-gray-300 text-gray-500 cursor-not-allowed"
                  disabled
                >
                  Connect Wallet to Deploy
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
