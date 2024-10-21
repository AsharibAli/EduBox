// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./EduBoxERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EduBoxERC721Factory is Ownable {
    uint256 public deploymentFee = 1 ether; // 1 EDU coin
    address public feeRecipient;
    
    event NFTContractDeployed(address indexed owner, address indexed nftContract);

    constructor(address _feeRecipient) {
        feeRecipient = _feeRecipient;
    }

    function deployNFTContract(
        string memory name,
        string memory symbol,
        string memory baseTokenURI
    ) public payable returns (address) {
        require(msg.value >= deploymentFee, "Insufficient deployment fee");
        
        // Deploy new EduBoxERC721 contract
        EduBoxERC721 newContract = new EduBoxERC721(
            name,
            symbol,
            baseTokenURI
        );
        
        // Transfer ownership to the caller
        newContract.transferOwnership(msg.sender);
        
        // Transfer the deployment fee to the fee recipient
        payable(feeRecipient).transfer(deploymentFee);
        
        // Refund any excess payment
        if (msg.value > deploymentFee) {
            payable(msg.sender).transfer(msg.value - deploymentFee);
        }
        
        emit NFTContractDeployed(msg.sender, address(newContract));
        
        return address(newContract);
    }

    function setDeploymentFee(uint256 newFee) public onlyOwner {
        deploymentFee = newFee;
    }

    function setFeeRecipient(address newRecipient) public onlyOwner {
        feeRecipient = newRecipient;
    }
}
