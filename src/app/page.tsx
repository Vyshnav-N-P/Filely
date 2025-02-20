'use client';
import {  } from 'react';
import './globals.css';
import FileUpload from './connect/component/fileupload';


export default function Home() {


  return (
    <>
      <div className='flex flex-col md:flex-row justify-between m-5'> 
        <p className="font-bold md:text-6xl text-4xl text-white">FILELY</p>
        <div className='z-10 flex gap-10 md:gap-20 '> 
        <a href="/connect" className='text-white  font-bold hover:border-t-4 text-lg md:text-xl pt-2 md:pt-5'>
          Connect
          </a>
          <a href="/about" className='text-white  font-bold  hover:border-t-4   text-lg md:text-xl pt-2 md:pt-5'>
          About Us
          </a>
          <a href="/contribute" className='text-white  font-bold hover:border-t-4  text-lg md:text-xl pt-2 md:pt-5'>
          Contribute
          </a>
        </div>
       
      </div>
     
      <div className="flex flex-col md:flex-row h-screen justify-center items-center -translate-y-20 gap-10">
        <div className='flex flex-col justify-center items-center align-middle gap-5'>
        <FileUpload />

        </div>

        <div className="flex flex-col align-middle items-center">
          <h3 className="text-white text-xl md:text-3xl">
            Share files directly from your device to anywhere
          </h3>
          <h4 className="text-white text-xs md:text-sm">
            Send files of any size directly from your device without ever storing
            anything online.
          </h4>
        </div>


      </div>
    </>
  );
}