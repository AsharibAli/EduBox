// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./EduBoxERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EduBoxERC721Factory is Ownable {
    uint256 public deploymentFee = 1 ether; // 1 EDU coin
    address public feeRecipient;
    
    struct CollectionInfo {
        address contractAddress;
        string name;
        string symbol;
        string baseURI;
        string collectionURI;
        uint256 maxSupply;
        uint256 mintPrice;
        uint96 royaltyFee;
        address owner;
    }
    
    CollectionInfo[] public deployedCollections;
    mapping(address => CollectionInfo[]) public userCollections;
    
    event NFTContractDeployed(
        address indexed owner,
        address indexed nftContract,
        string name,
        string symbol,
        uint256 maxSupply,
        uint256 mintPrice,
        uint96 royaltyFee
    );
    event DeploymentFeeUpdated(uint256 newFee);
    event FeeRecipientUpdated(address newRecipient);

    constructor(address _feeRecipient) {
        require(_feeRecipient != address(0), "Invalid fee recipient");
        feeRecipient = 0x89486a59fB05196745c50e80F9ACe761e919D77d;
    }

    function deployNFTContract(
        string memory name,
        string memory symbol,
        string memory baseTokenURI,
        string memory collectionURI,
        uint256 maxSupply,
        uint256 mintPrice,
        uint96 royaltyFee
    ) public payable returns (address) {
        require(msg.value >= deploymentFee, "Insufficient deployment fee");
        require(maxSupply > 0, "Max supply must be greater than 0");
        require(royaltyFee <= 10000, "Royalty fee cannot exceed 100%");
        
        // Deploy new EduBoxERC721 contract
        EduBoxERC721 newContract = new EduBoxERC721(
            name,
            symbol,
            baseTokenURI,
            maxSupply,
            mintPrice,
            royaltyFee
        );
        
        // Set collection URI
        newContract.setCollectionURI(collectionURI);
        
        // Transfer ownership to the caller
        newContract.transferOwnership(msg.sender);
        
        // Store collection info
        CollectionInfo memory newCollection = CollectionInfo({
            contractAddress: address(newContract),
            name: name,
            symbol: symbol,
            baseURI: baseTokenURI,
            collectionURI: collectionURI,
            maxSupply: maxSupply,
            mintPrice: mintPrice,
            royaltyFee: royaltyFee,
            owner: msg.sender
        });
        
        deployedCollections.push(newCollection);
        userCollections[msg.sender].push(newCollection);
        
        // Transfer the deployment fee to the fee recipient
        payable(feeRecipient).transfer(deploymentFee);
        
        // Refund any excess payment
        if (msg.value > deploymentFee) {
            payable(msg.sender).transfer(msg.value - deploymentFee);
        }
        
        emit NFTContractDeployed(
            msg.sender,
            address(newContract),
            name,
            symbol,
            maxSupply,
            mintPrice,
            royaltyFee
        );
        
        return address(newContract);
    }

    function getDeployedCollections() public view returns (CollectionInfo[] memory) {
        return deployedCollections;
    }

    function getUserCollections(address user) public view returns (CollectionInfo[] memory) {
        return userCollections[user];
    }

    function setDeploymentFee(uint256 newFee) public onlyOwner {
        deploymentFee = newFee;
        emit DeploymentFeeUpdated(newFee);
    }

    function setFeeRecipient(address newRecipient) public onlyOwner {
        require(newRecipient != address(0), "Invalid fee recipient");
        feeRecipient = newRecipient;
        emit FeeRecipientUpdated(newRecipient);
    }

    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        payable(owner()).transfer(balance);
    }
}
