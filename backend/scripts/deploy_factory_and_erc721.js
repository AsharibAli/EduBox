const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy EduBoxERC721Factory
  const EduBoxERC721Factory = await hre.ethers.getContractFactory("EduBoxERC721Factory");
  const feeRecipient = deployer.address; // You can change this to a different address if needed
  const factory = await EduBoxERC721Factory.deploy(feeRecipient);

  await factory.waitForDeployment();

  console.log("EduBoxERC721Factory deployed to:", await factory.getAddress());

  // Deploy a sample EduBoxERC721 using the factory
  const deploymentFee = hre.ethers.parseEther("1"); // 1 EDU coin
  const tx = await factory.deployNFTContract(
    "Sample NFT",
    "SNFT",
    "https://api.example.com/metadata/",
    { value: deploymentFee }
  );

  const receipt = await tx.wait();
  const deployedNFTAddress = receipt.logs.find(log => log.eventName === "NFTContractDeployed").args.nftContract;

  console.log("Sample EduBoxERC721 deployed to:", deployedNFTAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
