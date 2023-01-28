import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useContext } from 'react';

import images from '../assets';
import { NFTContext } from '../context/NFTcontext';
import { shortenAddress } from '../utils/shortenAddress';

const NFTCards = ({ nft, onProfilePage }) => {
  const { NFTcurrency } = useContext(NFTContext);

  return (
    //NOTE: 每個進來的nft都不一樣，所以用dynamic表示，query也可以等於一個object
    <Link href={{ pathname: '/nft-details', query: nft }}>
      <div className="flex-1 min-w-215 max-w-max xs:max-w-none sm:w-full sm:min-w-155 minmd:min-w-256 minlg:min-w-327 dark:bg-nft-black-3 bg-white rounded-2xl p-4 m-4 minlg:m-8 sm:my-2 sm:mx-2 cursor-pointer shadow-md">
        <div className="relative w-full h-52 sm:h-36 xs:h-56 minmd:h-60 minlg:h-300 rounded-2xl overflow-hidden">
          <Image src={nft.image || images[`nft${nft.index}`]} layout="fill" objectFit="cover" alt={`nft${nft.index}`} />
        </div>
        <div className="mt-3 flex flex-col">
          <p className="font-poppins dark:text-white text-nft-black-1 font-semibold text-xs minlg:text-lg  ">
            {nft.name}
          </p>
          <div className="flexBetween mt-1 minlg:mt-3 flex-row xs:flex-col xs:items-start xs:mt-3">
            <p className="font-poppins dark:text-white text-nft-black-1 font-semibold text-sm minlg:text-xl ">
              {nft.price} <span className="normal">{NFTcurrency}</span>
            </p>
            <p className="font-poppins dark:text-white text-nft-black-1 font-semibold text-sm minlg:text-xl ">
              {/* NOTE:在Profile Page上address顯示的是擁有者(owner)的address，在首頁是顯示seller的address */}
              {shortenAddress(onProfilePage ? nft.owner : nft.seller)}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default NFTCards;