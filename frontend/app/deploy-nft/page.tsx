// implement the page
"use client";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Web3 from "web3";
import contractJson from "@/contracts/EduBoxERC721.sol/EduBoxERC721.json";
import { CONTRACT_ADDRESSES } from "@/lib/config";

export default function DeployNFT() {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [baseURI, setBaseURI] = useState("");
  const { toast } = useToast();

  const deployNFT = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const web3 = new Web3(window.ethereum);
        const accounts = await web3.eth.getAccounts();
        const networkId = await web3.eth.net.getId();

        if (networkId !== BigInt(656476)) {
          // Open Campus Codex network ID
          toast({
            title: "Network Error",
            description: "Please connect to the Open Campus Codex network.",
            variant: "destructive",
          });
          return;
        }

        const contract = new web3.eth.Contract(
          contractJson.abi,
          CONTRACT_ADDRESSES.EduBoxERC721
        );

        const mintTransaction = contract.methods.mintNFT(accounts[0], baseURI);

        const gas = await mintTransaction.estimateGas({ from: accounts[0] });
        const result = await mintTransaction.send({
          from: accounts[0],
          gas: gas.toString(), // Convert gas to string
        });

        const tokenId = result.events?.Transfer?.returnValues?.tokenId;
        if (!tokenId) {
          throw new Error(
            "Failed to retrieve token ID from transaction result"
          );
        }

        toast({
          title: "NFT Minted",
          description: `NFT with ID ${tokenId} minted to ${accounts[0]}`,
        });
      } catch (error) {
        console.error("Error minting NFT:", error);
        toast({
          title: "Minting Error",
          description: "Failed to mint NFT. Please try again.",
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

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Deploy ERC721 NFT Collection</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              deployNFT();
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="name">Collection Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="symbol">Collection Symbol</Label>
              <Input
                id="symbol"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="baseURI">Base URI</Label>
              <Input
                id="baseURI"
                value={baseURI}
                onChange={(e) => setBaseURI(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Deploy NFT Collection
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
