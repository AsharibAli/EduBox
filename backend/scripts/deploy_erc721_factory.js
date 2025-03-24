const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying EduBoxERC721Factory with account:", deployer.address);

  const EduBoxERC721Factory = await hre.ethers.getContractFactory("EduBoxERC721Factory");
  const factory = await EduBoxERC721Factory.deploy();

  await factory.waitForDeployment();

  console.log("EduBoxERC721Factory deployed to:", await factory.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });