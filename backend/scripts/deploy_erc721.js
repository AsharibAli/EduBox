const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying EduBoxERC721 with account:", deployer.address);

  const EduBoxERC721 = await hre.ethers.getContractFactory("EduBoxERC721");
  const nft = await EduBoxERC721.deploy("EduBox NFT", "EDUNFT", "https://api.edubox.com/token/");

  // Wait for the contract to be mined
  await nft.waitForDeployment();

  console.log("EduBoxERC721 deployed to:", await nft.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
