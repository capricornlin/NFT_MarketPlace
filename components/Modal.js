import React from 'react';
import { useRef } from 'react';
import { useTheme } from 'next-themes';
import Image from 'next/image';

import images from '../assets';

const Modal = ({ header, body, footer, handleClose }) => {
  //> 可以抓住指定的DOM
  const modalRef = useRef(null);
  const { theme } = useTheme();

  const handleClickOutside = (e) => {
    // > e是指click event
    // > e.target就是只在螢幕上的座標
    //NOTE: modalRef是指定成Modal了，所以如果modal pop出來 且 e.target不在modal的範圍內就執行handleClose的意思
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      handleClose();
    }
  };

  return (
    <div className="flexCenter fixed inset-0 z-20 bg-overlay-black animated fadeIn" onClick={handleClickOutside}>
      {/* NOTE: modalRef指定給這個DOM了 */}
      <div ref={modalRef} className="w-2/5 md:w-11/12 minlg:w-2/4 dark:bg-nft-dark bg-white flex flex-col rounded-lg">
        <div className="flex justify-end mt-4 mr-4 minlg:mt-6 minlg:mr-6">
          <div className="relative w-3 h-3 minlg:w-6 minlg:h-6 cursor-pointer " onClick={handleClose}>
            {/* NOTE: Next/image 使用 fill 時，父層元素，也就是你的容器要使用 display: relative */}
            <Image src={images.cross} layout="fill" className={theme === 'light' ? 'filter invert' : ''} />
          </div>
        </div>
        <div className="flexCenter w-full text-center p-4 ">
          <h2 className="font-poppins dark:text-white text-nft-black-1 font-normal text-2xl">{header}</h2>
        </div>
        <div className="p-10 sm:px-4 border-t border-b dark:border-nft-black-3 border-nft-gray-1 ">{body}</div>
        {/* NOTE: flex裡面可以自動把text識別為一個div */}
        <div className="flexCenter p-4">{footer}</div>
      </div>
    </div>
  );
};

export default Modal;
