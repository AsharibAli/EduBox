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
import factoryAbi from "@/contracts/EduBoxERC721Factory.sol/EduBoxERC721Factory.json";
import Link from "next/link";
import { FaPalette } from "react-icons/fa";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const FACTORY_ADDRESS = "0x2e01874fED174bC51DB65b3e7a85C360Cc62c0c1";

export default function DeployNFT() {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [baseURI, setBaseURI] = useState("");
  const [isDeploying, setIsDeploying] = useState(false);
  const [isDeployed, setIsDeployed] = useState(false);
  const [deployedNFTAddress, setDeployedNFTAddress] = useState("");
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

  const deployNFT = async () => {
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

      const factory = new web3.eth.Contract(factoryAbi.abi, FACTORY_ADDRESS);

      const deploymentFee = web3.utils.toWei("1", "ether"); // 1 EDU coin
      const deployTransaction = factory.methods.deployNFTContract(
        name,
        symbol,
        baseURI
      );

      const gas = await deployTransaction.estimateGas({
        from: accounts[0],
        value: deploymentFee,
      });
      const result = await deployTransaction.send({
        from: accounts[0],
        gas: gas.toString(),
        value: deploymentFee,
      });

      if (result.events && "NFTContractDeployed" in result.events) {
        const deployedNFTAddress = result.events.NFTContractDeployed
          .returnValues.nftContract as string;
        setDeployedNFTAddress(deployedNFTAddress);
        setIsDeployed(true);
      } else {
        console.error("NFTContractDeployed event not found in result");
      }
      toast({
        title: "NFT Collection Deployed Successfully",
        description: `NFT contract deployed to ${deployedNFTAddress}`,
      });
    } catch (error) {
      console.error("Error deploying NFT:", error);
      toast({
        title: "Deployment Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to deploy NFT. Please try again.",
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
                <FaPalette className="mr-2" /> Deploy Your NFT Collection
              </CardTitle>
              <CardDescription>
                Fill in the details to create your ERC721 NFT collection on
                EduChain
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  deployNFT();
                }}
                className="space-y-6"
              >
                <div>
                  <Label htmlFor="name">Collection Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="mt-1"
                    placeholder="e.g., My Awesome NFT Collection"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    The name of your NFT collection. Choose a unique and
                    descriptive name.
                  </p>
                </div>
                <div>
                  <Label htmlFor="symbol">Collection Symbol</Label>
                  <Input
                    id="symbol"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    required
                    className="mt-1"
                    placeholder="e.g., AWESOME"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    A short, unique identifier for your collection (usually 3-5
                    characters).
                  </p>
                </div>
                <div>
                  <Label htmlFor="baseURI">Base URI</Label>
                  <Input
                    id="baseURI"
                    value={baseURI}
                    onChange={(e) => setBaseURI(e.target.value)}
                    required
                    className="mt-1"
                    placeholder="e.g., https://api.example.com/nft/"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    The base URL for your NFT metadata. This should be a URL
                    that returns JSON metadata for each token ID.
                  </p>
                </div>
                {/* Add the new message here */}
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-blue-700 text-sm">
                    <strong>Note:</strong> Creating a NFT collection costs 1
                    $EDU token!
                  </p>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-teal-500 hover:bg-teal-600 text-white"
                  disabled={isDeploying}
                >
                  {isDeploying ? "Deploying..." : "Deploy NFT Collection"}
                </Button>
              </form>
              {isDeployed && (
                <div className="mt-4">
                  <p className="text-green-600 font-semibold">
                    NFT Collection deployed successfully!
                  </p>
                  <p className="text-sm text-gray-600">
                    Address: {deployedNFTAddress}
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
