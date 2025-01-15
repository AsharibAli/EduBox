const { ethers } = require("hardhat");

async function main() {
  // Define fee recipient address
  const feeRecipient = "0x89486a59fB05196745c50e80F9ACe761e919D77d";

  // Deploy Factory
  console.log("Deploying EduBoxERC721Factory...");
  const Factory = await ethers.getContractFactory("EduBoxERC721Factory");
  const factory = await Factory.deploy(feeRecipient);
  await factory.waitForDeployment();

  const factoryAddress = await factory.getAddress();
  console.log("EduBoxERC721Factory deployed to:", factoryAddress);
  console.log("Fee recipient set to:", feeRecipient);

  // Verify fee recipient
  const setFeeRecipient = await factory.feeRecipient();
  console.log("Verified fee recipient:", setFeeRecipient);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });