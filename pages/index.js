import { useState, useEffect, useRef, useContext } from 'react';
import Image from 'next/image';
import { useTheme } from 'next-themes';

import {
  Banner,
  CreatorCard,
  Loader,
  NFTCards,
  SearchBar,
} from '../components';
import images from '../assets';
import { makeId } from '../utils/makeId';
import { NFTContext } from '../context/NFTcontext';
import getTopCreators from '../utils/getTopCreators';
import { shortenAddress } from '../utils/shortenAddress';

export default function Home() {
  const [hiddenButton, setHiddenButton] = useState(false);
  const [nfts, setNfts] = useState([]);
  const [nftCopy, setNftCopy] = useState([]);
  const [activeSelect, setActiveSelect] = useState('Recently added');
  const [isLoading, setIsLoading] = useState(true);

  const parentRef = useRef(null);
  const scrollRef = useRef(null);
  const { theme } = useTheme();
  const { fetchNFTs } = useContext(NFTContext);

  useEffect(() => {
    // NOTE: return a Promise
    //> 利用Promise的特性
    fetchNFTs().then((items) => {
      setNfts(items);
      setNftCopy(items);
      setIsLoading(false);
      // console.log({ items });
    });
    // fetchNFTs();
  }, []);

  useEffect(() => {
    const sortednfts = [...nfts];

    switch (activeSelect) {
      case 'Price (low to high)':
        setNfts(sortednfts.sort((a, b) => a.price - b.price));

        break;
      case 'Price (high to low)':
        setNfts(sortednfts.sort((a, b) => b.price - a.price));
        break;

      case 'Recently added':
        setNfts(sortednfts.sort((a, b) => b.tokenId - a.tokenId));
        break;

      default:
        setNfts(nfts);
        break;
    }
  }, [activeSelect]);

  const onHandleSearch = (value) => {
    //> filter不會改變original array
    const filterNFTs = nfts.filter(({ name }) =>
      name.toLowerCase().includes(value.toLowerCase())
    );

    if (filterNFTs.length) {
      //>但是這邊會改變nft array
      setNfts(filterNFTs);
    } else {
      // console.log('not filter anything');
      //> reshow all nfts
      setNfts(nftCopy);
    }
  };

  const onClearSearch = () => {
    // > no need nfts.length
    if (nfts.length && nftCopy.length) {
      setNfts(nftCopy);
    }
  };

  const isScrollable = () => {
    const { current } = scrollRef;
    const { current: parent } = parentRef;
    //BUG:這邊少一個?會導致抓到null
    if (current?.scrollWidth >= parent?.offsetWidth) {
      setHiddenButton(false);
    } else {
      setHiddenButton(true);
    }
  };
  // const isScrollable = () => {
  //   const { current } = scrollRef;
  //   const { current: parent } = parentRef;

  //   if (current?.scrollWidth >= parent?.offsetWidth) return setHiddenButton(false);
  //   return setHiddenButton(true);
  // };

  useEffect(() => {
    isScrollable();
    window.addEventListener('resize', isScrollable);

    return () => {
      window.removeEventListener('resize', isScrollable);
    };
  });

  const handleScroll = (dir) => {
    const { current } = scrollRef;

    const scrollAmount = window.innerWidth > 1800 ? 270 : 210;

    if (dir === 'left') {
      current.scrollLeft -= scrollAmount;
    } else {
      current.scrollLeft += scrollAmount;
    }
  };

  const TopCreators = getTopCreators(nftCopy);
  // console.log({ TopCreators });

  return (
    <div className="flex justify-center sm:px-4 p-12">
      <div className="w-full minmd:w-4/5">
        <Banner
          parentStyles="justify-start mb-6 h-72 sm:h-60 p-12 xs:p-4 xs:h-45 rounded-3xl"
          childStyles="md:text-4xl sm:text-2xl xs:text-xl text-left"
          name={
            <>
              Discover, collect, and sell <br /> extraordinary NFTs
            </>
          }
        />

        {!isLoading && !nfts.length ? (
          <h1 className="font-poppins dark:text-white text-nft-black-1 text-2xl minlg:text-4xl font-semibold ml-4 xs:ml-0">
            That's weird... No NFT for sale!
          </h1>
        ) : isLoading ? (
          <Loader />
        ) : (
          <>
            <div>
              <h1 className="font-poppons dark:text-white text-nft-black-1 text-2xl minlg:text-4xl font-semibold ml-4 xs:ml-0">
                Top Sellers
              </h1>
              <div
                className="relative flex-1 max-w-full flex mt-3"
                ref={parentRef}
              >
                <div
                  className="flex flex-row w-max overflow-x-scroll no-scroll select-none"
                  ref={scrollRef}
                >
                  {TopCreators.map((creator, index) => {
                    return (
                      <CreatorCard
                        key={creator.seller}
                        rank={index + 1}
                        creatorImage={images[`creator${index + 1}`]}
                        creatorName={shortenAddress(creator.seller)}
                        creatorEths={creator.sum}
                      />
                    );
                  })}

                  {!hiddenButton && (
                    <>
                      <div
                        onClick={() => handleScroll('left')}
                        className="absolute w-8 h-8 minlg:w-12 minlg:12 top-45 cursor-pointer left-0"
                      >
                        <Image
                          className={theme === 'light' ? 'filter invert' : ''}
                          src={images.left}
                          layout="fill"
                          objectFit="contain"
                          alt="left_arrow"
                        />
                      </div>
                      <div
                        onClick={() => handleScroll('right')}
                        className="absolute w-8 h-8 minlg:w-12 minlg:12 top-45 cursor-pointer right-0"
                      >
                        <Image
                          className={theme === 'light' ? 'filter invert' : ''}
                          src={images.right}
                          layout="fill"
                          objectFit="contain"
                          alt="right_arrow"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-10 ">
              <div className="flexBetween mx-4 xs:mx-0 minlg:mx-8 sm:flex-col sm:items-start">
                <h1 className="flex-1 font-poppons dark:text-white text-nft-black-1 text-2xl minlg:text-4xl font-semibold sm:mb-5">
                  Hot NFTs
                </h1>
                {/* > flex-2是代表比上面的<h1>的flex-1多一倍寬度  */}
                <div className="flex-2 sm:w-full flex flex-row sm:flex-col">
                  <SearchBar
                    activeSelect={activeSelect}
                    setActiveSelect={setActiveSelect}
                    handleSearch={onHandleSearch}
                    clearSearch={onClearSearch}
                  />
                </div>
              </div>
              <div className="mt-3 w-full flex flex-wrap justify-start md:justify-center">
                {nfts.map((nft) => (
                  <NFTCards key={nft.tokenId} nft={nft} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
