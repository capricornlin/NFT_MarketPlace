import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTheme } from 'next-themes';

import images from '../assets';

const SearchBar = ({ activeSelect, setActiveSelect, handleSearch, clearSearch }) => {
  const [search, setSearch] = useState('');
  const [toggle, setToggle] = useState(false);
  const [deboundedSearch, setDeboundedSearch] = useState(search);

  const { theme } = useTheme();

  useEffect(() => {
    //NOTE: 必須至少等1秒在更新search的內容，要不然都是利用deboundedSearch的改變來造成re-render而以，我們是利用search的內容來搜尋nft，所以在search內容改變前都不會產生搜尋內容
    const timer = setTimeout(() => {
      setSearch(deboundedSearch);
    }, 1000);
    //>執行useEffect前先把timer給歸0，
    return () => clearTimeout(timer);
  }, [deboundedSearch]);

  useEffect(() => {
    if (search) {
      handleSearch(search);
      //   console.log({ search });
    } else {
      //>serach被清空狀態
      clearSearch();
    }
  }, [search]);

  return (
    //> flex-1的重點在於可以伸縮
    <>
      <div className="flex-1 flexCenter dark:bg-nft-black-2 bg-white border dark:border-nft-2 border-nft-gray-2 py-3 px-4 rounded-md">
        <Image
          src={images.search}
          objectFit="contain"
          width={20}
          height={20}
          alt="search"
          className={theme === 'light' ? 'filter invert' : undefined}
        />
        <input
          type="text"
          placeholder="Search NFT here..."
          className="dark:bg-nft-black-2 bg-white mx-4 w-full darl:text-white text-nft-black-1 font-normal text-xs outline-none"
          onChange={(e) => setDeboundedSearch(e.target.value)}
          value={deboundedSearch}
        />
      </div>
      <div
        //> 因為useState是非同步的
        onClick={() => setToggle((prevToggle) => !prevToggle)}
        className="relative flexBetween ml-4 sm:ml-0 sm:mt-2 min-w-190 cursor-pointer dark:bg-nft-black-2 bg-white border dark:border-nft-2 border-nft-gray-2 py-3 px-4 rounded-md"
      >
        <p className="font-poppins dark:text-white text-nft-black-1 font-normal text-xs ">{activeSelect}</p>
        <Image
          src={images.arrow}
          objectFit="contain"
          width={15}
          height={15}
          alt="arrow"
          className={theme === 'light' ? 'filter invert' : undefined}
        />
        {/* > top-full是會移到指定層外面 */}
        {toggle && (
          <div className="absolute top-full left-0 right-0 w-full mt-3 z-10 dark:bg-nft-black-2 bg-white border dark:border-nft-2 border-nft-gray-2 py-3 px-4 rounded-md">
            {['Recently added', 'Price (low to high)', 'Price (high to low)'].map((item) => (
              <p
                className="font-poppins dark:text-white text-nft-black-1 font-normal text-xs my-3 cursor-pointer"
                onClick={() => setActiveSelect(item)}
                key={item}
              >
                {item}
              </p>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default SearchBar;
