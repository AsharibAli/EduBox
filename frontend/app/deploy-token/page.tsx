// implement the page
"use client";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Web3 from "web3";
import contractJson from "@/contracts/EduBoxERC20.sol/EduBoxERC20.json";
import { CONTRACT_ADDRESSES } from "@/lib/config";

export default function DeployToken() {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [initialSupply, setInitialSupply] = useState("");
  const [decimals, setDecimals] = useState("18");
  const { toast } = useToast();

  const deployToken = async () => {
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
          CONTRACT_ADDRESSES.EduBoxERC20
        );

        const mintTransaction = contract.methods.mint(
          accounts[0],
          web3.utils.toWei(initialSupply, "ether")
        );

        const gas = await mintTransaction.estimateGas({ from: accounts[0] });
        await mintTransaction.send({
          from: accounts[0],
          gas: gas.toString(),
        });

        toast({
          title: "Token Minted",
          description: `${initialSupply} tokens minted to ${accounts[0]}`,
        });
      } catch (error) {
        console.error("Error minting token:", error);
        toast({
          title: "Minting Error",
          description: "Failed to mint tokens. Please try again.",
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
          <CardTitle>Deploy ERC20 Token</CardTitle>
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
              />
            </div>
            <div>
              <Label htmlFor="symbol">Token Symbol</Label>
              <Input
                id="symbol"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                required
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
              />
            </div>
            <Button type="submit" className="w-full">
              Deploy Token
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
