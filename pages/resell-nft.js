import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

import { NFTContext } from '../context/NFTcontext';
import { Button, Loader, Input } from '../components';

const RecellNFT = () => {
  const { createSale, isLoadingNFT } = useContext(NFTContext);
  const router = useRouter();
  // > 從router拿到tokenId,tokenURI
  const { tokenId, tokenURI } = router.query;
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');

  const fetchNFT = async () => {
    if (!tokenURI) return;
    // > 我們將nft上傳到ipfs 裡面有data object
    const { data } = await axios.get(tokenURI);
    // console.log({ data });
    setPrice(data.price);
    setImage(data.image);
    setIsLoading(false);
  };
  //NOTE: 這種useEffect的用法，就不需要設置dynamic routing了，利用傳進來的tokenURI變化就可以刷新成不同頁面
  //NOTE:所以resell-nft不是dynamic routing
  useEffect(() => {
    fetchNFT();
  }, [tokenId]);

  const resell = async () => {
    await createSale(tokenURI, price, true, tokenId);

    router.push('/');
  };

  if (isLoadingNFT) {
    return (
      <div className="flexStart min-h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex justify-center sm:px-4 p-12">
      <div className="w-3/5 md:w-full">
        <h1 className="font-poppins dark:text-white text-nft-black font-semibold text-2xl">Resell NFT</h1>
        <Input inputType="number" title="Price" placeholder="NFT Price" handleClick={(e) => setPrice(e.target.value)} />
        {image && <img src={image} className="rounded mt-4 " width={350} />}
        <div className="mt-7 w-full flex justify-end">
          <Button btnName="List NFT" classStyle="rounded-xl" handleClick={resell} />
        </div>
      </div>
    </div>
  );
};

export default RecellNFT;
