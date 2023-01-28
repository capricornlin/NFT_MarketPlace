import React from 'react';
import { useState, useEffect, useContext } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';

import { NFTContext } from '../context/NFTcontext';
import { NFTCards, Loader, Button, Modal } from '../components';
import images from '../assets';
import { shortenAddress } from '../utils/shortenAddress';

const PaymentBodyCmp = ({ nft, nftCurrency }) => {
  return (
    <div className="flex flex-col">
      <div className="flexBetween">
        <p className="font-poppins dark:text-white text-nft-black-1 font-semibold text-base minlg:text-xl">
          Item
        </p>
        <p className="font-poppins dark:text-white text-nft-black-1 font-semibold text-base minlg:text-xl">
          Subtotal
        </p>
      </div>

      <div className="flexBetweenStart my-5">
        {/* >flex-1 主要就是可以佔用剩餘全部的空間 flex-grow:1 flex-shrink:1 */}
        <div className="flex-1 flexStartCenter">
          <div className="relative w-28 h-28">
            <Image src={nft.image} layout="fill" objectFit="cover" />
          </div>
          <div className="flexCenterStart flex-col ml-5">
            <p className="font-poppins dark:text-white text-nft-black-1 font-semibold text-sm minlg:text-xl">
              {shortenAddress(nft.seller)}
            </p>
            <p className="font-poppins dark:text-white text-nft-black-1 font-semibold text-sm minlg:text-xl">
              {nft.name}
            </p>
          </div>
        </div>
        <div>
          <p className="font-poppins dark:text-white text-nft-black-1 font-normal text-sm minlg:text-xl">
            {nft.price}
            <span className="font-semibold">{nftCurrency}</span>
          </p>
        </div>
      </div>

      <div className="flexBetween mt-10">
        <p className="font-poppins dark:text-white text-nft-black-1 font-normal text-base minlg:text-xl">
          Total
        </p>
        <p className="font-poppins dark:text-white text-nft-black-1 font-normal text-sm minlg:text-xl">
          {nft.price}
          <span className="font-semibold">{nftCurrency}</span>
        </p>
      </div>
    </div>
  );
};

const NFTDetails = () => {
  const { currentAccount, NFTcurrency, BuyNFT, isLoadingNFT } =
    useContext(NFTContext);
  const [isLoading, setIsLoading] = useState(true);
  const [nft, setNft] = useState({
    image: '',
    tokenId: '',
    name: '',
    owner: '',
    price: '',
    seller: '',
    tokenURI: '',
  });
  const [paymentModal, setPaymentModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    // > router.query是一個object
    setNft(router.query);
    // console.log({ nft });
    setIsLoading(false);
    //> router.isReady是拿來判斷是否能從useRouter()中取值
  }, [router.isReady]);

  if (isLoading) return <Loader />;

  const checkout = async () => {
    await BuyNFT(nft);
    setPaymentModal(false);
    setSuccessModal(true);
  };

  return (
    <div className="relative flex justify-center md:flex-col min-h-screen">
      <div className="relative flex-1 flexCenter sm:px-4 p-12 border-r md:border-r-0 md:border-b dark:border-nft-black-1 border-nft-fray-1">
        <div className="relative w-557 minmd:w-2/3 minmd:h-2/3 sm:w-full sm:h-300 h-557">
          {/* NOTE: dynamic routing */}
          <Image
            src={nft.image}
            objectFit="cover"
            className="rounded-xl shadow-lg"
            layout="fill"
          />
        </div>
      </div>
      {/* > ==========================================================================*/}
      {/* > flex-1 是指這個div flex-1而已 */}
      <div className="flex-1 justify-start sm:px-4 p-12 sm:pb-4">
        <div className="flex flex-row sm:flex-col">
          <h2 className="font-poppins dark:text-white text-nft-black-1 font-semibold text-2xl minlg:text-3xl">
            {nft.name}
          </h2>
        </div>

        <div className="mt-10">
          <p className="font-poppins dark:text-white text-nft-black-1 text-xs minlg:text-base font-normal">
            Creator
          </p>
          <div className="flex flex-row items-center mt-3">
            <div className="relative w-12 h-12 minlg:w-20 minlg:h-20 mr-2">
              <Image
                src={images.creator1}
                objectFit="cover"
                className="rounded-full"
              />
            </div>
            <p className="font-poppins dark:text-white text-nft-black-1 text-xs minlg:text-base font-semibold">
              {shortenAddress(nft.seller)}
            </p>
          </div>
        </div>
        <div className="mt-10 flex flex-col">
          <div className="w-full border-b dark:border-nft-black-1 border-nft-gray-1 flex flex-row">
            <p className="font-poppins dark:text-white text-nft-black-1 text-base minlg:text-base font-medium mb-2">
              Details
            </p>
          </div>
          <div className="mt-3">
            <p className="font-poppins dark:text-white text-nft-black-1 text-base  font-normal">
              {nft.description}
            </p>
          </div>
        </div>
        <div className="flex flex-row sm:flex-col mt-10 ">
          {/* NOTE: nested ternery expressions */}
          {/* >擁有這個nft且已經放上marketplace要sell */}
          {currentAccount === nft.seller.toLowerCase() ? (
            <p className='className="font-poppins dark:text-white text-nft-black-1 text-base  font-normal border border-gray p-2'>
              You cannot buy your own NFT
            </p>
          ) : currentAccount === nft.owner.toLowerCase() ? (
            <Button
              // > 擁有這個nft但還沒擺上marketplace要sell
              btnName="List on MarketPlace"
              classStyle="mr-5 sm:mr-0 sm:mb-5 rounded-xl"
              handleClick={() => {
                // NOTE: 這邊我們可以自訂URL，而且還是導流到resell-nft page，這樣就不用用超多層dynamic router
                //BUG:這邊多打一個}
                router.push(
                  `/resell-nft?tokenId=${nft.tokenId}&tokenURI=${nft.tokenURI}`
                );
              }}
            />
          ) : (
            // > 還沒擁有這個nft
            <Button
              btnName={`Buy for ${nft.price} ${NFTcurrency}`}
              classStyle="mr-5 sm:mr-0 sm:mb-5 rounded-xl"
              // > handleClick只是一個參數而已，我們是把{}裡的東西傳進去Button
              handleClick={() => setPaymentModal(true)}
            />
          )}
        </div>
      </div>

      {paymentModal && (
        <Modal
          header="Check out"
          body={<PaymentBodyCmp nft={nft} nftCurrency={NFTcurrency} />}
          footer={
            <div className="flex flex-row sm:flex-col ">
              <Button
                btnName="Checkout"
                classStyle="mr-5 sm:mb-5 sm:mr-0 rounded-xl"
                handleClick={checkout}
              />
              <Button
                btnName="Cancel"
                classStyle=" rounded-xl"
                handleClick={() => setPaymentModal(false)}
              />
            </div>
          }
          //> handleClose只是一個參數而已，我們是把{}裡的東西傳進去Button
          handleClose={() => setPaymentModal(false)}
        />
      )}

      {isLoadingNFT && (
        <Modal
          header="Buying NFT..."
          body={
            <div className="flexCenter flex-col text-center">
              <div className="relative w-52 h-52">
                <Loader />
              </div>
            </div>
          }
          handleClose={() => setPaymentModal(false)}
        />
      )}

      {successModal && (
        <Modal
          header="Payment Successful"
          body={
            <div
              className="flexCenter flex-col text-center"
              onClick={() => setSuccessModal(false)}
            >
              <div className="relative w-52 h-52">
                <Image
                  src={nft.image || images[`nft${nft.i}`]}
                  objectFit="cover"
                  layout="fill"
                />
                {/* <Image src={nft.image} width={200} height={200} /> */}
              </div>
              <p className="font-poppins dark:text-white text-nft-black-1 text-sm minlg:text-xl font-normal mt-10">
                {' '}
                You successfully purchased{' '}
                <span className="font-semibold">{nft.name}</span> from{' '}
                <span className="font-semibold">
                  {shortenAddress(nft.seller)}
                </span>
                .
              </p>
            </div>
          }
          footer={
            <div className="flexCenter flex-col">
              <Button
                btnName="Check it out"
                btnType="primary"
                classStyles="sm:mr-0 sm:mb-5 rounded-xl"
                handleClick={() => router.push('/my-nfts')}
              />
            </div>
          }
          //> handleClose只是一個參數而已，我們是把{}裡的東西傳進去Button
          handleClose={() => setSuccessModal(false)}
        />
      )}
    </div>
  );
};

export default NFTDetails;
