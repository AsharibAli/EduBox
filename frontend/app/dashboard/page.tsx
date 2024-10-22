"use client";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Web3 from "web3";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FaCoins, FaPalette } from "react-icons/fa";
import { CONTRACT_ADDRESSES } from "@/lib/config";
import ERC20FactoryJson from "@/contracts/EduBoxERC20Factory.sol/EduBoxERC20Factory.json";
import ERC20Json from "@/contracts/EduBoxERC20.sol/EduBoxERC20.json";
import ERC721FactoryJson from "@/contracts/EduBoxERC721Factory.sol/EduBoxERC721Factory.json";
import ERC721Json from "@/contracts/EduBoxERC721.sol/EduBoxERC721.json";
import Link from "next/link";

interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  totalSupply: string;
  decimals: number;
  cap: string;
  logoURL: string;
  website: string;
  socialMediaLinks: string;
}

interface NFTInfo {
  address: string;
  name: string;
  symbol: string;
}

export default function Dashboard() {
  const [isConnected, setIsConnected] = useState(false);
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [nfts, setNFTs] = useState<NFTInfo[]>([]);
  const [accountAddress, setAccountAddress] = useState("");
  const [balance, setBalance] = useState("");
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        const accounts = await web3Instance.eth.requestAccounts();
        if (accounts.length > 0) {
          setIsConnected(true);
          setAccountAddress(accounts[0]);
          const balanceWei = await web3Instance.eth.getBalance(accounts[0]);
          const balanceEth = web3Instance.utils.fromWei(balanceWei, "ether");
          setBalance(parseFloat(balanceEth).toFixed(4));
          setIsLoading(true);
          try {
            await fetchDeployedContracts(web3Instance, accounts[0]);
          } catch (error) {
            console.error("Error fetching deployed contracts:", error);
            toast({
              title: "Fetch Error",
              description:
                "Failed to fetch your deployed contracts. Please try again.",
              variant: "destructive",
            });
          } finally {
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error);
        toast({
          title: "Connection Error",
          description: "Failed to connect to your wallet. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Wallet Not Found",
        description: "Please install MetaMask or another Web3 wallet.",
        variant: "destructive",
      });
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAccountAddress("");
    setBalance("");
    setTokens([]);
    setNFTs([]);
    setWeb3(null);
  };

  const fetchDeployedContracts = async (
    web3Instance: Web3,
    account: string
  ) => {
    try {
      const networkId = await web3Instance.eth.net.getId();

      if (networkId !== BigInt(656476)) {
        toast({
          title: "Wrong Network",
          description: "Please connect to the Open Campus Codex network.",
          variant: "destructive",
        });
        return;
      }

      // Fetch ERC20 tokens
      const erc20Factory = new web3Instance.eth.Contract(
        ERC20FactoryJson.abi as any,
        CONTRACT_ADDRESSES.EduBoxERC20Factory
      );
      const erc20CreationEvents = await erc20Factory.getPastEvents(
        "TokenCreated",
        {
          filter: { owner: account },
          fromBlock: 0,
          toBlock: "latest",
        }
      );

      const tokenPromises = erc20CreationEvents.map(async (event: any) => {
        const tokenAddress = event.returnValues.tokenAddress;
        const tokenContract = new web3Instance.eth.Contract(
          ERC20Json.abi as any,
          tokenAddress
        );
        const [
          name,
          symbol,
          totalSupply,
          decimals,
          cap,
          logoURL,
          website,
          socialMediaLinks,
        ]: any = await Promise.all([
          tokenContract.methods.name().call(),
          tokenContract.methods.symbol().call(),
          tokenContract.methods.totalSupply().call(),
          tokenContract.methods.decimals().call(),
          tokenContract.methods.cap().call(),
          tokenContract.methods.logoURL().call(),
          tokenContract.methods.website().call(),
          tokenContract.methods.socialMediaLinks().call(),
        ]);
        return {
          address: tokenAddress,
          name,
          symbol,
          totalSupply: web3Instance.utils.fromWei(totalSupply, "ether"),
          decimals: parseInt(decimals),
          cap: web3Instance.utils.fromWei(cap, "ether"),
          logoURL,
          website,
          socialMediaLinks,
        };
      });

      const fetchedTokens: any = await Promise.all(tokenPromises);
      setTokens(fetchedTokens);

      // Fetch ERC721 NFTs
      const erc721Factory = new web3Instance.eth.Contract(
        ERC721FactoryJson.abi as any,
        CONTRACT_ADDRESSES.EduBoxERC721Factory
      );
      const erc721DeploymentEvents = await erc721Factory.getPastEvents(
        "NFTContractDeployed",
        {
          filter: { owner: account },
          fromBlock: 0,
          toBlock: "latest",
        }
      );

      const nftPromises = erc721DeploymentEvents.map(async (event: any) => {
        const nftAddress = event.returnValues.nftContract;
        const nftContract = new web3Instance.eth.Contract(
          ERC721Json.abi as any,
          nftAddress
        );
        const [name, symbol]: any = await Promise.all([
          nftContract.methods.name().call(),
          nftContract.methods.symbol().call(),
        ]);
        return {
          address: nftAddress,
          name,
          symbol,
        };
      });

      const fetchedNFTs: any = await Promise.all(nftPromises);
      setNFTs(fetchedNFTs);
    } catch (error) {
      console.error("Error fetching deployed contracts:", error);
      throw error;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        isConnected={isConnected}
        onConnect={checkWalletConnection}
        onDisconnect={disconnectWallet}
      />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-teal-800">
          Your EduBox Dashboard
        </h1>

        {isConnected ? (
          <div className="mb-8 text-center bg-white p-4 rounded-lg shadow">
            <p className="text-lg">
              <strong>Wallet Address:</strong> {accountAddress}
            </p>
            <p className="text-lg">
              <strong>Balance:</strong> {balance} EDU
            </p>
          </div>
        ) : (
          <div className="text-center mt-8">
            <Button
              onClick={checkWalletConnection}
              className="bg-teal-500 hover:bg-teal-600 text-white"
            >
              Connect Wallet to View Assets
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="text-center">
            <p className="text-xl">Loading your assets...</p>
          </div>
        ) : (
          <>
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-teal-700">
                Your ERC20 Tokens
              </h2>
              {tokens.length === 0 ? (
                <p className="text-center bg-white p-4 rounded-lg shadow">
                  No ERC20 tokens deployed yet.{" "}
                  <Link href="/deploy-token">
                    <span className="text-teal-600 hover:text-teal-700 underline cursor-pointer">
                      Create your first token!
                    </span>
                  </Link>
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tokens.map((token, index) => (
                    <Card
                      key={index}
                      className="hover:shadow-lg transition-shadow duration-300 bg-white"
                    >
                      <CardHeader>
                        <CardTitle className="flex items-center text-xl text-teal-600">
                          <FaCoins className="mr-2" /> {token.name} (
                          {token.symbol})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="mb-2">
                          <strong>Contract Address:</strong> {token.address}
                        </p>
                        <p className="mb-2">
                          <strong>Total Supply:</strong> {token.totalSupply}{" "}
                          {token.symbol}
                        </p>
                        <p className="mb-2">
                          <strong>Decimals:</strong> {token.decimals}
                        </p>
                        {token.cap && (
                          <p className="mb-2">
                            <strong>Cap:</strong> {token.cap} {token.symbol}
                          </p>
                        )}
                        {token.logoURL && (
                          <p className="mb-2">
                            <strong>Logo:</strong>{" "}
                            <a
                              href={token.logoURL}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline"
                            >
                              View Logo
                            </a>
                          </p>
                        )}
                        {token.website && (
                          <p className="mb-2">
                            <strong>Website:</strong>{" "}
                            <a
                              href={token.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline"
                            >
                              {token.website}
                            </a>
                          </p>
                        )}
                        {token.socialMediaLinks && (
                          <p className="mb-2">
                            <strong>Social Media:</strong>{" "}
                            <a
                              href={token.socialMediaLinks}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline"
                            >
                              {token.socialMediaLinks}
                            </a>
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-teal-700">
                Your ERC721 NFT Collections
              </h2>
              {nfts.length === 0 ? (
                <p className="text-center bg-white p-4 rounded-lg shadow">
                  No NFT collections deployed yet.{" "}
                  <Link href="/deploy-nft">
                    <span className="text-teal-600 hover:text-teal-700 underline cursor-pointer">
                      Create your first NFT collection!
                    </span>
                  </Link>
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {nfts.map((nft, index) => (
                    <Card
                      key={index}
                      className="hover:shadow-lg transition-shadow duration-300 bg-white"
                    >
                      <CardHeader>
                        <CardTitle className="flex items-center text-xl text-teal-600">
                          <FaPalette className="mr-2" /> {nft.name} (
                          {nft.symbol})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="mb-2">
                          <strong>Contract Address:</strong> {nft.address}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
