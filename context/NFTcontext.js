import React, { useState, useEffect } from 'react';
import Web3Modal from 'web3modal';
import { ethers } from 'ethers';
import axios from 'axios';
import { create as ipfsHttpClient } from 'ipfs-http-client';

import { MarketAddress, MarketAddressABI } from './constant';

// const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0');
// const subdomaimName = 'https://casey-lin1989.infura-ipfs.io';
const projectId = '2GzLUsxu7SRJbggVCBwNOVq15WS';
const projectSecret = '23f60d0018f05d1117b29929c2574549';
const auth =
  'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');
// const endpointBasePath = 'https://' + subdomaimName + '.infura-ipfs.io/ipfs/';
const client = ipfsHttpClient({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  apiPath: '/api/v0',
  headers: {
    authorization: auth,
  },
});

const fetchContract = (signerOrProvider) =>
  new ethers.Contract(MarketAddress, MarketAddressABI, signerOrProvider);

export const NFTContext = React.createContext();

export const NFTProvider = ({ children }) => {
  const NFTcurrency = 'ETH';
  const [currentAccount, setCurrentAccount] = useState('');
  const [isLoadingNFT, setIsLoadingNFT] = useState(false);

  //NOTE:在頁面reload的時候可以自動判別這個帳號是不是已經connected的了
  const CheckIfWallerIsConnected = async () => {
    if (!window.ethereum) return alert('Please install Metamask');

    const accounts = await window.ethereum.request({ method: 'eth_accounts' });

    if (accounts.length) {
      setCurrentAccount(accounts[0]);
      console.log('CurrentAccount', accounts[0]);
    } else {
      console.log('No Account Found!');
    }
  };
  //NOTE: 檢查metamask Account是否有改變
  //BUG:為什麼能監測到帳號的變化，跟context裡的變化有關嗎？
  //> ethereum.on這是一個Event Listener
  const checkIfAccountChanged = async () => {
    try {
      const { ethereum } = window;
      //NOTE:這是一個event listener
      ethereum.on('accountsChanged', (accounts) => {
        console.log('Account changed to:', accounts[0]);
        setCurrentAccount(accounts[0]);
      });
    } catch (error) {
      console.log(error);
    }
  };

  //NOTE: 這邊代表每次使用useContext的時候，都會先經過這個useEffect()
  //NOTE:checkIfAccountChanged放在useEffect裡則是為了避免window not find的問題，而且可以在一開始的時候就發出監聽事件
  //NOTE: 在一開始就執行checkIfAccountChanged()，然後裡面的ethereum.on()監聽就開始了
  useEffect(() => {
    CheckIfWallerIsConnected();
    checkIfAccountChanged();
  }, []);

  const ConnectWallet = async () => {
    if (!window.ethereum) return alert('Please install Metamask');

    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });

    setCurrentAccount(accounts[0]);

    //NOTE: 刷新頁面
    window.location.reload();
  };

  const UploadToIPFS = async (file) => {
    try {
      const added = await client.add({ content: file });
      // const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      const url = `https://casey-lin1989.infura-ipfs.io/ipfs/${added.path}`;
      // const url = endpointBasePath + added.path;
      return url;
    } catch (error) {
      console.log('Error uploading file to ipfs : ', error);
    }
  };

  const createNFT = async (formInput, fileUrl, router) => {
    const { name, description, price } = formInput;

    if (!name || !description || !price || !fileUrl) return;

    const data = JSON.stringify({ name, description, image: fileUrl, price });

    try {
      const added = await client.add(data);
      const url = `https://casey-lin1989.infura-ipfs.io/ipfs/${added.path}`;
      // > 只傳前兩個parameter也可以
      await createSale(url, price);
      router.push('/');
    } catch (error) {
      console.log('Error to create NFT : ', error);
    }
  };
  // > 要上架NFT
  const createSale = async (url, formInputPrice, isReselling, id) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    //NOTE: web3provider是連接matamask的
    const provider = new ethers.providers.Web3Provider(connection);
    // > 需要transaction就要用signer才行
    const signer = provider.getSigner();

    const price = ethers.utils.parseUnits(formInputPrice, 'ether');
    //NOTE:這邊代表contract已經可以跟metamask互動了
    const contract = fetchContract(signer);
    const listingPrice = await contract.getListingPrice();
    const transaction = !isReselling
      ? await contract.createToken(url, price, {
          value: listingPrice.toString(),
        })
      : await contract.resellToken(id, price, {
          value: listingPrice.toString(),
        });
    //NOTE:這邊 setIsLoadingNFT = true之所以後面沒接setIsLoadingNFT = false是因為在fatchNFTs一開頭，我們有設setIsLoadingNFT = false
    setIsLoadingNFT(true);
    //NOTE: wait()是ehter.js裡的function
    await transaction.wait();

    console.log(contract);
  };

  const fetchNFTs = async () => {
    setIsLoadingNFT(false);
    //NOTE:這個provider一樣也是要讀取Ethereum上的資料
    //BUGFIX:要上傳到Goreli時這邊要更改！！ 要把infura url加上去
    const provider = new ethers.providers.JsonRpcProvider(
      'https://goerli.infura.io/v3/4a336c45a610447ebcc52981cd8e43c3'
    );
    const contract = fetchContract(provider);

    const data = await contract.fetchMarketItems();
    //NOTE:Promise.all回傳值是一個Promise
    const items = await Promise.all(
      data.map(async ({ tokenId, seller, owner, price: unformattedPrice }) => {
        //NOTE: tokenURI是ERC721URIStorage裡面的function，而我們的contract有繼承ERC721URIStorage
        const tokenURI = await contract.tokenURI(tokenId);
        const {
          data: { image, name, description },
        } = await axios.get(tokenURI);
        // > formatUnits
        const price = ethers.utils.formatUnits(
          unformattedPrice.toString(),
          'ether'
        );

        return {
          price,
          tokenId: tokenId.toNumber(),
          id: tokenId.toNumber(),
          seller,
          owner,
          image,
          name,
          description,
          tokenURI,
        };
      })
    );

    return items;
  };

  const fetchMyNFTsOrListedNFTs = async (type) => {
    setIsLoadingNFT(false);
    //NOTE:因為我們需要知道msg.sender是誰，所以需要登入Metamask
    // > fetchItemListed和fetchMyNFTs都有要使用msg.sender
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const contract = fetchContract(signer);

    const data =
      type === 'fetchItemsListed'
        ? await contract.fetchItemListed()
        : await contract.fetchMyNFTs();
    //>都是用Promise.all
    const items = await Promise.all(
      data.map(async ({ tokenId, seller, owner, price: unformattedPrice }) => {
        //NOTE: tokenURI是ERC721URIStorage裡面的function，而我們的contract有繼承ERC721URIStorage
        const tokenURI = await contract.tokenURI(tokenId);
        const {
          data: { image, name, description },
        } = await axios.get(tokenURI);
        // > formatUnits
        const price = ethers.utils.formatUnits(
          unformattedPrice.toString(),
          'ether'
        );

        return {
          price,
          tokenId: tokenId.toNumber(),
          id: tokenId.toNumber(),
          seller,
          owner,
          image,
          name,
          description,
          tokenURI,
        };
      })
    );

    return items;
  };

  const BuyNFT = async (nft) => {
    //NOTE:因為我們需要知道msg.sender是誰，所以需要登入Metamask
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const contract = fetchContract(signer);
    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether');
    // > createMarketSale會用到msg.sender
    const transaction = await contract.createMarketSale(nft.tokenId, {
      value: price,
    }); //>>msg.value
    setIsLoadingNFT(true);
    await transaction.wait();
    setIsLoadingNFT(false);
  };

  return (
    <NFTContext.Provider
      value={{
        NFTcurrency,
        ConnectWallet,
        currentAccount,
        UploadToIPFS,
        createNFT,
        fetchNFTs,
        fetchMyNFTsOrListedNFTs,
        BuyNFT,
        createSale,
        isLoadingNFT,
      }}
    >
      {children}
    </NFTContext.Provider>
  );
};
