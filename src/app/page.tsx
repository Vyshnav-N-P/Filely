'use client';
import './globals.css';
import { useState } from 'react';

export default function Home() {
  const [fileName,Setfilename] = useState('');

  //Handle file selections
  const handlefilechange = (e:any) =>{
    const file=e.target.files?.[0];
    console.log(file.name);
    if (file){
      Setfilename(file.name);
      console.log(file.name);
    };
  };
  return (
    <>
    <p className=' font-bold text-6xl text-white'>FILELY</p>
     <div className="flex min-h-screen justify-center items-center -translate-y-20 gap-10 ">
        <div className="w-64 h-40 bg-white shadow-2xl rounded-lg p-4 hover:bg-gray-300  hover:text-blue-300 text-white text-xl">
            <input type="file" className="hidden" id="fileInput" onChange={handlefilechange} />
            <label htmlFor="fileInput" className="flex justify-center items-center w-full h-full bg-gray-300 rounded-lg  cursor-pointer hover:bg-white">
              Upload File
            </label>
        </div>
        
        <div className='flex flex-col align-middle items-center'>
        <h3 className='text-white text-3xl'>Share files directly from your device to anywhere</h3>
        <h4 className='text-white'>Send files of any size directly from your device without ever storing anything online.</h4>
        </div>
     </div>
     </>
   
  );
}