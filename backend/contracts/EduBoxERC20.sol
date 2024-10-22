// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract EduBoxERC20 is ERC20, ERC20Burnable, Pausable, Ownable {
    using SafeMath for uint256;

    uint8 private _decimals;
    mapping(address => bool) public blacklist;
    uint256 public maxTransferAmount;
    bool public transferFeeEnabled;
    uint256 public transferFeePercentage;
    address public feeCollector;

    string public logoURL;
    string public website;
    string public socialMediaLinks;

    uint256 public immutable cap;

    event Blacklisted(address indexed account, bool status);
    event MaxTransferAmountUpdated(uint256 amount);
    event TransferFeeUpdated(bool enabled, uint256 percentage);
    event FeeCollectorUpdated(address indexed newCollector);
    event MetadataUpdated(
        string logoURL,
        string website,
        string socialMediaLinks
    );

    constructor(
        string memory name,
        string memory symbol,
        uint8 tokenDecimals,
        uint256 initialSupply,
        uint256 _cap,
        address owner,
        string memory _logoURL,
        string memory _website,
        string memory _socialMediaLinks
    ) ERC20(name, symbol) {
        require(_cap > 0, "EduBoxERC20: cap is 0");
        require(
            initialSupply <= _cap,
            "EduBoxERC20: initial supply exceeds cap"
        );

        _decimals = tokenDecimals;
        cap = _cap;
        _mint(owner, initialSupply);
        transferOwnership(owner);
        maxTransferAmount = type(uint256).max;
        feeCollector = owner;

        logoURL = _logoURL;
        website = _website;
        socialMediaLinks = _socialMediaLinks;
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    function mint(address to, uint256 amount) public onlyOwner {
        require(totalSupply() + amount <= cap, "EduBoxERC20: cap exceeded");
        _mint(to, amount);
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function setBlacklist(address account, bool status) public onlyOwner {
        blacklist[account] = status;
        emit Blacklisted(account, status);
    }

    function setMaxTransferAmount(uint256 amount) public onlyOwner {
        maxTransferAmount = amount;
        emit MaxTransferAmountUpdated(amount);
    }

    function setTransferFee(bool enabled, uint256 percentage) public onlyOwner {
        require(percentage <= 100, "Fee percentage must be between 0 and 100");
        transferFeeEnabled = enabled;
        transferFeePercentage = percentage;
        emit TransferFeeUpdated(enabled, percentage);
    }

    function setFeeCollector(address newCollector) public onlyOwner {
        require(newCollector != address(0), "Invalid fee collector address");
        feeCollector = newCollector;
        emit FeeCollectorUpdated(newCollector);
    }

    function updateMetadata(
        string memory _logoURL,
        string memory _website,
        string memory _socialMediaLinks
    ) public onlyOwner {
        logoURL = _logoURL;
        website = _website;
        socialMediaLinks = _socialMediaLinks;
        emit MetadataUpdated(_logoURL, _website, _socialMediaLinks);
    }

    function _transfer(
        address sender,
        address recipient,
        uint256 amount
    ) internal virtual override {
        require(
            !blacklist[sender] && !blacklist[recipient],
            "Blacklisted address"
        );
        require(amount <= maxTransferAmount, "Transfer amount exceeds maximum");

        if (transferFeeEnabled && sender != owner() && recipient != owner()) {
            uint256 feeAmount = amount.mul(transferFeePercentage).div(100);
            uint256 transferAmount = amount.sub(feeAmount);
            super._transfer(sender, feeCollector, feeAmount);
            super._transfer(sender, recipient, transferAmount);
        } else {
            super._transfer(sender, recipient, amount);
        }
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }
}
