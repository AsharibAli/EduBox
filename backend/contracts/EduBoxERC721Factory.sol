// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./EduBoxERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EduBoxERC721Factory is Ownable {
    uint256 public constant CREATION_FEE = 1 ether; // 1 EDU token
    address public feeRecipient;

    struct CollectionInfo {
        address contractAddress;
        string name;
        string symbol;
        string baseURI;
        string collectionURI;
        uint256 maxSupply;
        uint256 mintPrice;
        address owner;
    }

    CollectionInfo[] public deployedCollections;

    event NFTContractDeployed(
        address indexed owner,
        address indexed nftContract,
        string name,
        string symbol,
        uint256 maxSupply,
        uint256 mintPrice
    );

    constructor() {
        feeRecipient = 0x1fcb879Bf709ccDfc2C2CFB39aFD836a63612e58;
    }

    function deployNFTContract(
        string memory name,
        string memory symbol,
        string memory baseTokenURI,
        string memory collectionURI,
        uint256 maxSupply,
        uint256 mintPrice
    ) public payable returns (address) {
        require(msg.value >= CREATION_FEE, "Insufficient creation fee");
        require(maxSupply > 0, "Max supply must be greater than 0");

        // Transfer fee to recipient
        payable(feeRecipient).transfer(CREATION_FEE);

        // Refund excess
        if (msg.value > CREATION_FEE) {
            payable(msg.sender).transfer(msg.value - CREATION_FEE);
        }

        // Deploy new EduBoxERC721 contract
        EduBoxERC721 newContract = new EduBoxERC721(
            name,
            symbol,
            baseTokenURI,
            maxSupply,
            mintPrice
        );

        // Set collection URI
        newContract.setCollectionURI(collectionURI);

        // Transfer ownership to the caller
        newContract.transferOwnership(msg.sender);

        // Store collection info
        deployedCollections.push(
            CollectionInfo({
                contractAddress: address(newContract),
                name: name,
                symbol: symbol,
                baseURI: baseTokenURI,
                collectionURI: collectionURI,
                maxSupply: maxSupply,
                mintPrice: mintPrice,
                owner: msg.sender
            })
        );

        emit NFTContractDeployed(
            msg.sender,
            address(newContract),
            name,
            symbol,
            maxSupply,
            mintPrice
        );

        return address(newContract);
    }

    function getDeployedCollections()
        public
        view
        returns (CollectionInfo[] memory)
    {
        return deployedCollections;
    }

    function getCollectionCount() public view returns (uint256) {
        return deployedCollections.length;
    }

    function setFeeRecipient(address _newRecipient) external onlyOwner {
        require(_newRecipient != address(0), "Invalid address");
        feeRecipient = _newRecipient;
    }

    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        payable(owner()).transfer(balance);
    }
}
