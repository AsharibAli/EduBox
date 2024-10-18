import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ConnectWallet from "@/components/ConnectWallet";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">EduBox dApp</h1>
      <ConnectWallet />
      <div className="grid md:grid-cols-2 gap-8 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Deploy ERC20 Token</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Create your own ERC20 token with customizable parameters.
            </p>
            <Link href="/deploy-token" passHref>
              <Button className="w-full">Deploy Token</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Deploy ERC721 NFT</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Create your own NFT collection with customizable metadata.
            </p>
            <Link href="/deploy-nft" passHref>
              <Button className="w-full">Deploy NFT</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
