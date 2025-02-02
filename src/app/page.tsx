'use client';
import { useEffect } from 'react';
import './globals.css';
import FileUpload from './Components/fileupload';
export default function Home() {


  return (
    <>
      <div className='flex justify-between'> 
        <p className="font-bold text-6xl text-white">FILELY</p>
        <div className='z-10'> 
          <a href="/about" className='text-white  font-bold hover:text-blue-200  text-xl pt-5'>
          About Us
          </a>
        </div>
       
      </div>
     
      <div className="flex h-screen justify-center items-center -translate-y-20 gap-10">
       <FileUpload />

        <div className="flex flex-col align-middle items-center">
          <h3 className="text-white text-3xl">
            Share files directly from your device to anywhere
          </h3>
          <h4 className="text-white">
            Send files of any size directly from your device without ever storing
            anything online.
          </h4>
        </div>
      </div>
    </>
  );
}