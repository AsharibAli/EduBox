const hre = require("hardhat");
const { parseEther } = require("ethers");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying EduBoxERC20 with account:", deployer.address);

  const EduBoxERC20 = await hre.ethers.getContractFactory("EduBoxERC20");
  const token = await EduBoxERC20.deploy("EduBox Token", "EDU", parseEther("1000000"), deployer.address);

  // Wait for the contract to be mined
  await token.waitForDeployment();

  console.log("EduBoxERC20 deployed to:", await token.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
