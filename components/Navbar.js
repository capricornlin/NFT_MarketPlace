import React from 'react';
import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';

import images from '../assets';
import { Button } from './';
import { NFTContext } from '../context/NFTcontext';

const MenuItem = ({ isMobile, active, setActive, setIsopen }) => {
  const generateLink = (index) => {
    switch (index) {
      case 0:
        return '/';
      case 1:
        return '/listed-nfts';
      case 2:
        return '/my-nfts';

      default:
        return '/';
    }
  };

  return (
    <>
      <ul className={`list-none flexCenter flex-row ${isMobile && 'flex-col h-full'}`}>
        {['Explore NFTs', 'Listed NFTs', 'My NFTs'].map((item, index) => (
          <li
            key={index}
            onClick={() => {
              setActive(item);
              if (isMobile) {
                // > setIsopen: 按完後表單會自動關上
                setIsopen(false);
              }
            }}
            className={`flex flex-row items-center font-poppins font-semibold text-base dark:hover:text-white hover:text-nft-dark mx-3 ${
              active === item ? 'dark:text-white text-nft-black-1' : 'dark:text-nft-gray-3 text-nft-gray-2'
            }`}
          >
            <Link href={generateLink(index)}>{item}</Link>
          </li>
        ))}
      </ul>
    </>
  );
};

const ButtonGroup = ({ setActive, router, setIsopen }) => {
  // const hasConnected = true;
  const { ConnectWallet, currentAccount } = useContext(NFTContext);

  return currentAccount ? (
    <Button
      btnName="Create"
      classStyle="mx-2 rounded-xl"
      handleClick={() => {
        setActive('');
        setIsopen(false);
        router.push('/create-nft');
      }}
    />
  ) : (
    <Button btnName="Connect" classStyle="mx-2 rounded-xl" handleClick={ConnectWallet} />
  );
};

const checkActive = (active, setActive, router) => {
  switch (router.pathname) {
    case '/':
      if (active !== 'Explore NFTs') setActive('Explore NFTs');
      break;
    case '/listed-nfts':
      if (active !== 'Listed NFTs') setActive('Listed NFTs');
      break;
    case '/my-nfts':
      if (active !== 'My NFTs') setActive('My NFTs');
      break;
    case '/create-nfts':
      setActive('');
      break;

    default:
      setActive('');
  }
};

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [active, setActive] = useState('Explore NFTs');
  const [isopen, setIsopen] = useState(false);

  //   console.log({ theme: theme });
  useEffect(() => {
    checkActive(active, setActive, router);
    // console.log({ active });
  }, [router.pathname]);

  useEffect(() => {
    setTheme('dark');
  }, []);

  return (
    <>
      <nav
        className="flexBetween w-full fixed z-10 p-4 
    flex-row border-b dark:bg-nft-dark bg-white dark:border-nft-black-1 border-nft-gray-1"
      >
        <div className="flex flex-1 flex-row justify-start">
          <Link href="/">
            <div
              className="flexCenter md:hidden cursor-pointer"
              onClick={() => {
                setActive('Explore NFTs');
              }}
            >
              {/* TODO: height */}
              <Image src={images.logo02} objectFit="contain" width={32} height={32} alt="logo" />
              <p className="dark:text-white text-nft-black-1 font-semobold text-lg ml-1">CryptoKet</p>
            </div>
          </Link>
          <Link href="/">
            <div
              className="hidden md:flex"
              onClick={() => {
                setActive('Explore NFTs');
                setIsopen(false);
              }}
            >
              {/* //TODO: height */}
              <Image src={images.logo02} objectFit="contain" width={32} height={32} alt="logo" />
            </div>
          </Link>
        </div>
        <div className="flex flex-initial flex-row justify-end">
          <div className="flex items-center mr-2">
            <input
              type="checkbox"
              className="checkbox"
              id="checkbox"
              onChange={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            />
            <label
              htmlFor="checkbox"
              className="items-center flexBetween w-8 h-4 bg-black rounded-2xl p-1 relative label"
            >
              <i className="fas fa-sun " />
              <i className="fas fa-moon " />
              <div className="w-3 h-3 absolute bg-white rounded-full ball" />
            </label>
          </div>
          <div className="md:hidden flex">
            <MenuItem active={active} setActive={setActive} />
            <div className="ml-4 ">
              <ButtonGroup setActive={setActive} router={router} setIsopen={setIsopen} />
            </div>
          </div>
        </div>
        <div className="hidden md:flex ml-2">
          {isopen ? (
            <Image
              src={images.cross}
              objectFit="contain"
              width={20}
              height={20}
              alt="close"
              onClick={() => {
                setIsopen(false);
              }}
              className={theme === 'light' ? 'filter invert' : ''}
            />
          ) : (
            <Image
              src={images.menu}
              objectFit="contain"
              width={25}
              height={25}
              alt="menu"
              onClick={() => {
                setIsopen(true);
              }}
              className={theme === 'light' ? 'filter invert' : ''}
            />
          )}
          {isopen && (
            <div className="fixed inset-0 top-65 dark:bg-nft-dark bg-white z-10 nav-h flex justify-between flex-col">
              <div className="flex-1 p-4">
                {/* >setIsopen 按完後表單會自動關上  */}
                <MenuItem active={active} setActive={setActive} isMobile setIsopen={setIsopen} />
              </div>
              <div className="p-4 border-t dark:border-nft-black-1 border-nft-gray-1">
                <ButtonGroup setActive={setActive} router={router} setIsopen={setIsopen} />
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
