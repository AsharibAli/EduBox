// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./EduBoxERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EduBoxERC20Factory is Ownable {
    uint256 public constant CREATION_FEE = 1 ether;
    address public feeRecipient;
    struct TokenInfo {
        address tokenAddress;
        string name;
        string symbol;
        address owner;
    }

    TokenInfo[] public createdTokens;

    event FeeRecipientUpdated(address indexed newRecipient);

    event TokenCreated(
        address indexed tokenAddress,
        string name,
        string symbol,
        address indexed owner
    );

    constructor() {
        feeRecipient = 0x89486a59fB05196745c50e80F9ACe761e919D77d;
    }

    function createToken(
        string memory name,
        string memory symbol,
        uint8 decimals,
        uint256 initialSupply,
        uint256 cap,
        string memory logoURL,
        string memory website,
        string memory socialMediaLinks
    ) external payable {
        require(msg.value >= CREATION_FEE, "Insufficient creation fee");
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(symbol).length > 0, "Symbol cannot be empty");
        require(initialSupply > 0, "Initial supply must be greater than 0");
        require(
            cap >= initialSupply,
            "Cap must be greater than or equal to initial supply"
        );

        // Transfer fee to recipient
        payable(feeRecipient).transfer(CREATION_FEE);

        // Refund excess
        if (msg.value > CREATION_FEE) {
            payable(msg.sender).transfer(msg.value - CREATION_FEE);
        }

        EduBoxERC20 newToken = new EduBoxERC20(
            name,
            symbol,
            decimals,
            initialSupply,
            cap,
            msg.sender,
            logoURL,
            website,
            socialMediaLinks
        );

        createdTokens.push(
            TokenInfo({
                tokenAddress: address(newToken),
                name: name,
                symbol: symbol,
                owner: msg.sender
            })
        );

        emit TokenCreated(address(newToken), name, symbol, msg.sender);
    }

    function setFeeRecipient(address _newRecipient) external onlyOwner {
        require(_newRecipient != address(0), "Invalid address");
        feeRecipient = _newRecipient;
        emit FeeRecipientUpdated(_newRecipient);
    }

    function getTokenCount() public view returns (uint256) {
        return createdTokens.length;
    }

    function getTokenInfo(
        uint256 index
    ) public view returns (TokenInfo memory) {
        require(index < createdTokens.length, "Token index out of bounds");
        return createdTokens[index];
    }

    function getCreatedTokens(
        uint256 start,
        uint256 end
    ) public view returns (TokenInfo[] memory) {
        require(start < end, "Invalid range");
        require(end <= createdTokens.length, "End out of bounds");

        TokenInfo[] memory tokens = new TokenInfo[](end - start);
        for (uint256 i = start; i < end; i++) {
            tokens[i - start] = createdTokens[i];
        }
        return tokens;
    }

    function withdrawFees() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
