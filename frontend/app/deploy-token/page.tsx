"use client";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Web3 from "web3";
import contractJson from "@/contracts/EduBoxERC20.sol/EduBoxERC20.json";
import { CONTRACT_ADDRESSES } from "@/lib/config";
import Link from "next/link";
import { FaCoins } from "react-icons/fa";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function DeployToken() {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [initialSupply, setInitialSupply] = useState("");
  const [decimals, setDecimals] = useState("18");
  const [isDeploying, setIsDeploying] = useState(false);
  const [isDeployed, setIsDeployed] = useState(false);
  const [deployedTokenAddress, setDeployedTokenAddress] = useState("");
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

  const { toast } = useToast();

  const deployToken = async () => {
    if (typeof window.ethereum === "undefined") {
      toast({
        title: "MetaMask Not Found",
        description: "Please install MetaMask to use this feature.",
        variant: "destructive",
      });
      return;
    }

    setIsDeploying(true);
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      const networkId = await web3.eth.net.getId();

      if (networkId !== BigInt(656476)) {
        throw new Error("Please connect to the Open Campus Codex network.");
      }

      const contract = new web3.eth.Contract(
        contractJson.abi,
        CONTRACT_ADDRESSES.EduBoxERC20
      );

      const mintTransaction = contract.methods.mint(
        accounts[0],
        web3.utils.toWei(initialSupply, "ether")
      );

      const gas = await mintTransaction.estimateGas({ from: accounts[0] });
      const result = await mintTransaction.send({
        from: accounts[0],
        gas: gas.toString(),
      });

      setDeployedTokenAddress(result.to);
      setIsDeployed(true);
      toast({
        title: "Token Deployed Successfully",
        description: `${initialSupply} tokens minted to ${accounts[0]}`,
      });
    } catch (error) {
      console.error("Error deploying token:", error);
      toast({
        title: "Deployment Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to deploy token. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        isConnected={isConnected}
        onConnect={checkWalletConnection}
        onDisconnect={disconnectWallet}
      />
      <main className="flex-grow container mx-auto px-4 py-16 flex flex-col justify-center items-center">
        <div className="max-w-2xl w-full space-y-8">
          <Card className="w-full bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-teal-700 flex justify-center items-center">
                <FaCoins className="mr-2" /> Deploy Your ERC20 Token
              </CardTitle>
              <CardDescription>
                Fill in the details to create your ERC20 token on EduChain
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  deployToken();
                }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="name">Token Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="symbol">Token Symbol</Label>
                  <Input
                    id="symbol"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="initialSupply">Initial Supply</Label>
                  <Input
                    id="initialSupply"
                    type="number"
                    value={initialSupply}
                    onChange={(e) => setInitialSupply(e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="decimals">Decimals</Label>
                  <Input
                    id="decimals"
                    type="number"
                    value={decimals}
                    onChange={(e) => setDecimals(e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-teal-500 hover:bg-teal-600 text-white"
                  disabled={isDeploying}
                >
                  {isDeploying ? "Deploying..." : "Deploy Token"}
                </Button>
              </form>
              {isDeployed && (
                <div className="mt-4">
                  <p className="text-green-600 font-semibold">
                    Token deployed successfully!
                  </p>
                  <p className="text-sm text-gray-600">
                    Address: {deployedTokenAddress}
                  </p>
                  <Link href="/dashboard" passHref>
                    <Button className="w-full mt-2 bg-teal-500 hover:bg-teal-600 text-white">
                      Go to Dashboard
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
