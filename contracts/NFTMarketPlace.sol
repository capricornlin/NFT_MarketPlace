
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4; // set version to match with waht we have in our hardhat configuration


// Using ERC721 standard
// Functionality we can use
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "hardhat/console.sol";


contract NFTMarketPlace is ERC721URIStorage {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;
    Counters.Counter private _itemsSold;

    uint256 listingPrice = 0.025 ether;

    address payable owner;

    mapping(uint256 => MarketItem) private idToMarketItem; // id to market item

    //>js object like
    struct MarketItem {
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }

    event MarketItemCreated(
        uint256 indexed tokenId,
        address  seller,
        address  owner,
        uint256 price,
        bool sold
    );

    constructor() ERC721("Metaverse","META") {
        // NOTE:owner就是deploy這個contract的人,所以並不是contract address
        owner = payable(msg.sender); 
    }

    function updateListingPrice(uint _ListingPrice) public payable{
        require(owner == msg.sender,'Only marketplace owner can upfate the listing price');

        listingPrice = _ListingPrice;
    }

    function getListingPrice() public view returns(uint256){
        return listingPrice;
    }

    //NOTE:將img轉換成NFT, 有payable代表可以接收ether到contract balance裡的意思，所以也是接收listing price到contract裡
    function createToken(string memory tokenURI,uint256 price) public payable returns(uint){
        _tokenIds.increment();

        uint256 newTokenId = _tokenIds.current();

        _mint(msg.sender,newTokenId);
        _setTokenURI(newTokenId,tokenURI);

        createMarketItem(newTokenId,price);

        return newTokenId;
    }
    //>將NFT放到marketplace拍賣
    function createMarketItem(uint256 tokenId,uint256 price) private {
        require(price > 0,'Price must be at least 1');
        require(msg.value == listingPrice,'Price must be equal to listing price'); // msg.value : 呼叫createMarketItem時送進來的金錢

        idToMarketItem[tokenId] = MarketItem(
            tokenId,
            payable(msg.sender), //>seller
            payable(address(this)), //> owner, address(this) 是代表合約本身的地址
            price,
            false
        );

        _transfer(msg.sender, address(this), tokenId); //transfer ownership to this contract

        emit MarketItemCreated(tokenId, msg.sender, address(this),price,false);

    }
    //>將買回來的NFT再放到Marketplace上面賣
    function resellToken(uint256 tokenId, uint256 price) public payable { 
        //要把錢送給這function
        require(idToMarketItem[tokenId].owner == msg.sender,'Only item owner can perform this operation');
        require(msg.value == listingPrice,'Price must be equal to listing price');

        //>把NFT重新擺到市場上賣，所以onwer就轉手給contract
        idToMarketItem[tokenId].sold = false;
        idToMarketItem[tokenId].price = price;
        idToMarketItem[tokenId].seller = payable(msg.sender);
        idToMarketItem[tokenId].owner = payable(address(this));

        _itemsSold.decrement();

        _transfer(msg.sender, address(this), tokenId); //將NFT擁有權轉給contract本身

    }
    //NOTE:買NFT,payable代表可以送出ether，是因為要把listing price送給contract deployer
    function createMarketSale(uint256 tokenId) public payable{
        uint price = idToMarketItem[tokenId].price;

        require(msg.value == price,'Please submit the asking price in order to complete the purchase');

        idToMarketItem[tokenId].owner = payable(msg.sender);
        idToMarketItem[tokenId].sold = true;
        //QUES: 看不懂這行在幹嘛
        // idToMarketItem[tokenId].seller = payable(address(0)); 

        _itemsSold.increment();

        //>>transfer nft ownership
        _transfer(address(this), msg.sender, tokenId);

        //NOTE:global owner就是deploy這個contract的人,所以把listing price給deployer
        payable(owner).transfer(listingPrice); //>>把listingPrice給owner,owner就是marketplace

        //>>idToMarketItem[tokenId].seller就是賣這個NFT的人，通常就是某個人的地址
        payable(idToMarketItem[tokenId].seller).transfer(msg.value); //>>seller就是擁有這個nft的人
        // console.log('seller is ',idToMarketItem[tokenId].seller);
        
    }

    function fetchMarketItems() public view returns(MarketItem[] memory){
        uint itemCount = _tokenIds.current();
        uint unsoldItemCount = _tokenIds.current() - _itemsSold.current();
        uint currentIndex = 0;

        MarketItem[] memory items = new MarketItem[](unsoldItemCount);

        for(uint i = 0;i < itemCount;i++){
            if(idToMarketItem[i+1].owner == address(this)){
                uint currentId  = i+1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex+=1;
            }
        }
        return items;
    }

    function fetchMyNFTs() public view returns(MarketItem[] memory){
        //NOTE:因為我們需要知道msg.sender是誰，所以需要登入Metamask
        // > fetchItemListed和fetchMyNFTs都有要使用msg.sender
        uint totalItemCount = _tokenIds.current();
        uint itemCount = 0;
        uint currentIndex = 0;

        for(uint i = 0;i < totalItemCount;i++){ 
            if(idToMarketItem[i+1].owner == msg.sender){
                itemCount+=1;
            }
         }
         MarketItem[] memory items = new MarketItem[](itemCount);
         for(uint i = 0;i < totalItemCount;i++){
            if(idToMarketItem[i+1].owner == msg.sender){
                uint currentId  = i+1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex+=1;
            }
        }
        return items;
    }

    function fetchItemListed() public view returns(MarketItem[] memory){
        //NOTE:因為我們需要知道msg.sender是誰，所以需要登入Metamask
        // > fetchItemListed和fetchMyNFTs都有要使用msg.sender
        uint totalItemCount = _tokenIds.current();
        uint itemCount = 0;
        uint currentIndex = 0;

        for(uint i = 0;i < totalItemCount;i++){ 
            if(idToMarketItem[i+1].seller == msg.sender){
                itemCount+=1;
            }
         }
         MarketItem[] memory items = new MarketItem[](itemCount);
         for(uint i = 0;i < totalItemCount;i++){
            if(idToMarketItem[i+1].seller == msg.sender){
                uint currentId  = i+1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex+=1;
            }
        }
        return items;
    }

}