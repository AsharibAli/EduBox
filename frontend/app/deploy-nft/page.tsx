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
import { CONTRACT_ADDRESSES } from "@/lib/config";
import Link from "next/link";
import { FaPalette } from "react-icons/fa";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function DeployNFT() {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [baseTokenURI, setBaseTokenURI] = useState("");
  const [collectionURI, setCollectionURI] = useState("");
  const [maxSupply, setMaxSupply] = useState("");
  const [mintPrice, setMintPrice] = useState("");
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

      if (networkId !== BigInt(41923)) {
        throw new Error("Please connect to the EDU Chain Mainnet.");
      }

      const factory = new web3.eth.Contract(
        factoryAbi.abi,
        CONTRACT_ADDRESSES.EduBoxERC721Factory
      );

      const deployNFTTx = factory.methods.deployNFTContract(
        name,
        symbol,
        baseTokenURI,
        collectionURI,
        maxSupply,
        web3.utils.toWei(mintPrice, "ether")
      );

      const gas = await deployNFTTx.estimateGas({
        from: accounts[0],
        value: web3.utils.toWei("1", "ether"), // 1 EDU token as creation fee
      });

      const result = await deployNFTTx.send({
        from: accounts[0],
        gas: gas.toString(),
        value: web3.utils.toWei("1", "ether"), // 1 EDU token as creation fee
      });

      const nftDeployedEvent = result.events?.NFTContractDeployed;
      if (!nftDeployedEvent) {
        throw new Error("NFT contract deployment event not found");
      }
      const nftAddress = nftDeployedEvent.returnValues.nftContract;
      if (typeof nftAddress !== "string") {
        throw new Error("Invalid NFT contract address");
      }
      setDeployedNFTAddress(nftAddress);
      setIsDeployed(true);
      toast({
        title: "NFT Collection Deployed Successfully",
        description: `New NFT collection created at ${nftAddress}`,
      });
    } catch (error) {
      console.error("Error deploying NFT collection:", error);
      toast({
        title: "Deployment Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to deploy NFT collection. Please try again.",
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
                    A short identifier for your collection (usually 3-5
                    characters).
                  </p>
                </div>
                <div>
                  <Label htmlFor="baseTokenURI">Base Token URI</Label>
                  <Input
                    id="baseTokenURI"
                    value={baseTokenURI}
                    onChange={(e) => setBaseTokenURI(e.target.value)}
                    required
                    className="mt-1"
                    placeholder="e.g., https://api.example.com/nft/"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    The base URI for your NFT metadata. This will be used to
                    fetch metadata for each token.
                  </p>
                </div>
                <div>
                  <Label htmlFor="collectionURI">Collection URI</Label>
                  <Input
                    id="collectionURI"
                    value={collectionURI}
                    onChange={(e) => setCollectionURI(e.target.value)}
                    required
                    className="mt-1"
                    placeholder="e.g., https://example.com/collection-metadata"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    The URI for your collection metadata. This should contain
                    information about the entire collection.
                  </p>
                </div>
                <div>
                  <Label htmlFor="maxSupply">Maximum Supply</Label>
                  <Input
                    id="maxSupply"
                    type="number"
                    value={maxSupply}
                    onChange={(e) => setMaxSupply(e.target.value)}
                    required
                    className="mt-1"
                    placeholder="e.g., 10000"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    The maximum number of NFTs that can be minted in this
                    collection.
                  </p>
                </div>
                <div>
                  <Label htmlFor="mintPrice">Mint Price (EDU)</Label>
                  <Input
                    id="mintPrice"
                    type="number"
                    step="0.000000000000000001"
                    value={mintPrice}
                    onChange={(e) => setMintPrice(e.target.value)}
                    required
                    className="mt-1"
                    placeholder="e.g., 0.1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    The price in EDU tokens to mint each NFT from this
                    collection.
                  </p>
                </div>
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
