const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EduBoxERC20", function () {
  let EduBoxERC20;
  let token;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    EduBoxERC20 = await ethers.getContractFactory("EduBoxERC20");
    [owner, addr1, addr2] = await ethers.getSigners();
    token = await EduBoxERC20.deploy("EduBox Token", "EDU", ethers.utils.parseEther("1000000"), owner.address);
    await token.deployed();
  });

  it("Should have correct name and symbol", async function () {
    expect(await token.name()).to.equal("EduBox Token");
    expect(await token.symbol()).to.equal("EDU");
  });

  it("Should mint initial supply to owner", async function () {
    const ownerBalance = await token.balanceOf(owner.address);
    expect(await token.totalSupply()).to.equal(ownerBalance);
  });

  it("Should allow owner to mint new tokens", async function () {
    await token.mint(addr1.address, ethers.utils.parseEther("1000"));
    expect(await token.balanceOf(addr1.address)).to.equal(ethers.utils.parseEther("1000"));
  });

  it("Should allow owner to pause and unpause", async function () {
    await token.pause();
    await expect(token.transfer(addr1.address, 100)).to.be.revertedWith("Pausable: paused");
    await token.unpause();
    await expect(token.transfer(addr1.address, 100)).to.not.be.reverted;
  });
});