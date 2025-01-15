// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract EduBoxERC721 is ERC721, ERC721Enumerable, ERC2981, Pausable, Ownable {
    using Counters for Counters.Counter;
    using Strings for uint256;

    Counters.Counter private _tokenIds;
    string private _baseTokenURI;
    uint256 public maxSupply;
    uint256 public mintPrice;
    bool public whitelistOnly;
    mapping(address => bool) public whitelist;
    mapping(uint256 => string) private _tokenURIs;
    string public collectionURI;

    event BatchMinted(address indexed to, uint256[] tokenIds);
    event WhitelistUpdated(address indexed account, bool status);
    event WhitelistOnlyUpdated(bool status);
    event MintPriceUpdated(uint256 newPrice);
    event CollectionURIUpdated(string newURI);

    constructor(
        string memory name,
        string memory symbol,
        string memory baseTokenURI,
        uint256 _maxSupply,
        uint256 _mintPrice,
        uint96 royaltyFee
    ) ERC721(name, symbol) {
        _baseTokenURI = baseTokenURI;
        maxSupply = _maxSupply;
        mintPrice = _mintPrice;
        _setDefaultRoyalty(msg.sender, royaltyFee);
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function setWhitelistStatus(address account, bool status) public onlyOwner {
        whitelist[account] = status;
        emit WhitelistUpdated(account, status);
    }

    function setBatchWhitelist(address[] calldata accounts, bool status) public onlyOwner {
        for (uint256 i = 0; i < accounts.length; i++) {
            whitelist[accounts[i]] = status;
            emit WhitelistUpdated(accounts[i], status);
        }
    }

    function setWhitelistOnly(bool status) public onlyOwner {
        whitelistOnly = status;
        emit WhitelistOnlyUpdated(status);
    }

    function setMintPrice(uint256 _mintPrice) public onlyOwner {
        mintPrice = _mintPrice;
        emit MintPriceUpdated(_mintPrice);
    }

    function setCollectionURI(string memory newURI) public onlyOwner {
        collectionURI = newURI;
        emit CollectionURIUpdated(newURI);
    }

    function mintNFT(address recipient, string memory _tokenURI) 
        public 
        payable 
        whenNotPaused 
        returns (uint256) 
    {
        require(msg.value >= mintPrice, "Insufficient payment");
        require(_tokenIds.current() < maxSupply, "Max supply reached");
        if (whitelistOnly) {
            require(whitelist[recipient], "Address not whitelisted");
        }

        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _safeMint(recipient, newItemId);
        _tokenURIs[newItemId] = _tokenURI;

        // Refund excess payment
        if (msg.value > mintPrice) {
            payable(msg.sender).transfer(msg.value - mintPrice);
        }

        return newItemId;
    }

    function batchMint(
        address recipient,
        string[] memory uris,
        uint256 quantity
    ) public payable whenNotPaused returns (uint256[] memory) {
        require(msg.value >= mintPrice * quantity, "Insufficient payment");
        require(_tokenIds.current() + quantity <= maxSupply, "Would exceed max supply");
        if (whitelistOnly) {
            require(whitelist[recipient], "Address not whitelisted");
        }

        uint256[] memory tokenIds = new uint256[](quantity);
        for (uint256 i = 0; i < quantity; i++) {
            _tokenIds.increment();
            uint256 newItemId = _tokenIds.current();
            _safeMint(recipient, newItemId);
            _tokenURIs[newItemId] = uris[i];
            tokenIds[i] = newItemId;
        }

        // Refund excess payment
        uint256 totalCost = mintPrice * quantity;
        if (msg.value > totalCost) {
            payable(msg.sender).transfer(msg.value - totalCost);
        }

        emit BatchMinted(recipient, tokenIds);
        return tokenIds;
    }

    function tokenURI(uint256 tokenId) 
        public 
        view 
        virtual 
        override 
        returns (string memory) 
    {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

        string memory _tokenURI = _tokenURIs[tokenId];
        string memory base = _baseURI();

        if (bytes(base).length == 0) {
            return _tokenURI;
        }
        if (bytes(_tokenURI).length > 0) {
            return string(abi.encodePacked(base, _tokenURI));
        }
        return super.tokenURI(tokenId);
    }

    function setBaseURI(string memory newBaseURI) public onlyOwner {
        _baseTokenURI = newBaseURI;
    }

    function setRoyaltyInfo(address receiver, uint96 feeNumerator) public onlyOwner {
        _setDefaultRoyalty(receiver, feeNumerator);
    }

    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        payable(owner()).transfer(balance);
    }

    // Required overrides
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) whenNotPaused {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
