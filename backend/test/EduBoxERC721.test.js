const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EduBoxERC721", function () {
  let EduBoxERC721;
  let nft;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    EduBoxERC721 = await ethers.getContractFactory("EduBoxERC721");
    [owner, addr1, addr2] = await ethers.getSigners();
    nft = await EduBoxERC721.deploy("EduBox NFT", "EDUNFT", "https://api.edubox.com/token/");
    await nft.deployed();
  });

  it("Should have correct name and symbol", async function () {
    expect(await nft.name()).to.equal("EduBox NFT");
    expect(await nft.symbol()).to.equal("EDUNFT");
  });

  it("Should allow owner to mint NFTs", async function () {
    await nft.mintNFT(addr1.address, "1");
    expect(await nft.ownerOf(1)).to.equal(addr1.address);
    expect(await nft.tokenURI(1)).to.equal("https://api.edubox.com/token/1");
  });

  it("Should not allow non-owners to mint NFTs", async function () {
    await expect(nft.connect(addr1).mintNFT(addr2.address, "2")).to.be.revertedWith("Ownable: caller is not the owner");
  });
}); 