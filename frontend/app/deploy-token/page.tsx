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
import factoryAbi from "@/contracts/EduBoxERC20Factory.sol/EduBoxERC20Factory.json";
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
  const [cap, setCap] = useState("");
  const [logoURL, setLogoURL] = useState("");
  const [website, setWebsite] = useState("");
  const [socialMediaLinks, setSocialMediaLinks] = useState("");
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

      const factory = new web3.eth.Contract(
        factoryAbi.abi,
        CONTRACT_ADDRESSES.EduBoxERC20Factory
      );

      const createTokenTx = factory.methods.createToken(
        name,
        symbol,
        parseInt(decimals),
        web3.utils.toWei(initialSupply, "ether"),
        web3.utils.toWei(cap, "ether"),
        logoURL,
        website,
        socialMediaLinks
      );

      const gas = await createTokenTx.estimateGas({
        from: accounts[0],
        value: web3.utils.toWei("1", "ether"), // 1 native token as creation fee
      });

      const result = await createTokenTx.send({
        from: accounts[0],
        gas: gas.toString(),
        value: web3.utils.toWei("1", "ether"), // 1 native token as creation fee
      });

      const tokenCreatedEvent = result.events?.TokenCreated;
      if (!tokenCreatedEvent) {
        throw new Error("Token creation event not found");
      }
      const tokenAddress = tokenCreatedEvent.returnValues.tokenAddress;
      if (typeof tokenAddress !== "string") {
        throw new Error("Invalid token address");
      }
      setDeployedTokenAddress(tokenAddress);
      setIsDeployed(true);
      toast({
        title: "Token Deployed Successfully",
        description: `New token created at ${tokenAddress}`,
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
                className="space-y-6"
              >
                <div>
                  <Label htmlFor="name">Token Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="mt-1"
                    placeholder="e.g., My Awesome Token"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    The full name of your token. Choose a unique and descriptive
                    name.
                  </p>
                </div>
                <div>
                  <Label htmlFor="symbol">Token Symbol</Label>
                  <Input
                    id="symbol"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    required
                    className="mt-1"
                    placeholder="e.g., MAT"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    A short identifier for your token (usually 3-5 characters).
                  </p>
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
                    placeholder="e.g., 18"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    The number of decimal places for your token. 18 is standard
                    for most tokens.
                  </p>
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
                    placeholder="e.g., 1000"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    The initial amount of tokens to mint. This will be
                    multiplied by 10^decimals.
                  </p>
                </div>
                <div>
                  <Label htmlFor="cap">Maximum Supply</Label>
                  <Input
                    id="cap"
                    type="number"
                    value={cap}
                    onChange={(e) => setCap(e.target.value)}
                    required
                    className="mt-1"
                    placeholder="e.g., 10000"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    The maximum number of tokens that can ever exist. Set to 0
                    for no cap.
                  </p>
                </div>
                <div>
                  <Label htmlFor="logoURL">Logo URL</Label>
                  <Input
                    id="logoURL"
                    value={logoURL}
                    onChange={(e) => setLogoURL(e.target.value)}
                    className="mt-1"
                    placeholder="e.g., https://example.com/logo.png"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    A URL to your token&apos;s logo image. Leave blank if you
                    don&apos;t have one.
                  </p>
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="mt-1"
                    placeholder="e.g., https://myawesometoken.com"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Your token&apos;s official website. Leave blank if you
                    don&apos;t have one.
                  </p>
                </div>
                <div>
                  <Label htmlFor="socialMediaLinks">Twitter Link</Label>
                  <Input
                    id="socialMediaLinks"
                    value={socialMediaLinks}
                    onChange={(e) => setSocialMediaLinks(e.target.value)}
                    className="mt-1"
                    placeholder="e.g., https://x.com/mytoken"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Your token&apos;s Twitter/X profile link. Leave blank if you
                    don&apos;t have one.
                  </p>
                </div>
                {/* Add the new message here */}
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-blue-700 text-sm">
                    <strong>Note:</strong> Creating a token costs 1 $EDU token!
                  </p>
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
