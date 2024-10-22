const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying EduBoxERC20 with account:", deployer.address);

  const EduBoxERC20 = await hre.ethers.getContractFactory("EduBoxERC20");
  const token = await EduBoxERC20.deploy(
    "EduBox Token",                    // name
    "EDU",                             // symbol
    18,                                // decimals
    hre.ethers.parseEther("1000000"),  // initialSupply (1 million tokens)
    hre.ethers.parseEther("10000000"), // cap (10 million tokens)
    deployer.address,                  // owner
    "https://camo.githubusercontent.com/f19f92840d82b193ad6752c9b47cdda3c5839e3421907920e4198589fb69c0ec/68747470733a2f2f692e6962622e636f2f546757374831682f6564756875622e706e67",     // logoURL
    "https://box.eduhub.dev/",              // website
    "https://twitter.com/eduhub__"       // socialMediaLinks
  );

  await token.waitForDeployment();

  console.log("EduBoxERC20 deployed to:", await token.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


  // contract address: EduBoxERC20 deployed to: 0x7ea1212eB1f4c49F69e868A880A351cc91Ea3625