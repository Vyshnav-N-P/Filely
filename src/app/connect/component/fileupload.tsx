/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import '../../globals.css';
import Image from 'next/image';
import pdfimage from '../../../../public/Images/pdf-ICON.png';
import audioimage from '../../../../public/Images/audio-icon.png';
import { Suspense, useEffect, useState , } from 'react';
import Connect from '../page';
import { useFilelyStore } from '../../../stores/filelyStore';
//import Connect from '../connect/page';

export default function Fileupload() {
  //const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<any>(''); // For preview image
  const [fileName, setFileName] = useState('');
  const [connectControl, setConnectControl] = useState<boolean>(false);
  
  //ZUSTAND initializing
  const file = useFilelyStore((state) => state.FILE); 
  const setFile = useFilelyStore((state) => state.setFile);
  const removeFile = useFilelyStore((state) => state.removeFile);

// Debugging Zustand state updates
useEffect(() => {
  console.log('Updated file in Zustand:', file);
}, [file]); // This will log whenever `file` state changes

  // Handle file selection
  const handleFileChange = (e:any) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    
    setFileName(selectedFile.name);
    console.log("File changed to :"+selectedFile )
    const fr = new FileReader();
    fr.onload = () => {
      setPreviewUrl(fr.result);
    };
    fr.readAsDataURL(selectedFile);
  };

  // Preview of file
  const renderPreview = () => {
    if (!file) return null;

    if (file.type.match('image.*')) {
      return (
        <div className='w-52 h-80 flex flex-col justify-center items-center bg-gray-200 rounded-lg gap-2'>
          <Image src={previewUrl} alt="Preview" className=" h-full object-cover rounded-lg items-center" width="100" height="100"/>;
          <p className="text-black text-sm">{fileName}</p>
        </div>
      );
    } else if (file.type.match('audio.*')) {
      return (
      <div className='w-52 h-80 flex flex-col justify-center items-center align-middle bg-gray-200 rounded-lg gap-2'>
        <Image src={audioimage.src} alt="Audio Icon" className="w-16 h-16"  width="50" height="50"/>
        <audio controls src={previewUrl} className="w-full h-10" />
        <p className="text-black text-sm">{fileName}</p>
      </div>
      
    );
    } else if (file.type.match('application/pdf')) {
      return (
        <div className="w-52 h-80 flex flex-col justify-center items-center align-middle bg-gray-200 rounded-lg">
          <Image src={pdfimage.src} alt="PDF Icon" className="w-full h-full object-cover"  width="100" height="100"/>
          <p className="text-black ml-2">{fileName}</p>
        </div>
      );
    } 
    else if (file.type.match('video.*')){
      <div className='w-52 h-80 flex flex-col justify-center items-center bg-gray-200 rounded-lg gap-2'>
      <video controls preload="none" >
      <source src={previewUrl} type="video/mp4" />
      <track
        src=""
        kind="subtitles"
        srcLang="en"
        label="English"
      />
      Your browser does not support the video tag.
    </video>
    </div>
    }
    else {
      return (
        <div className="w-full h-full flex justify-center items-center bg-gray-200 rounded-lg">
          <p className="text-black">No preview available for this file type.</p>
        </div>
      );
    }
  };

  const shareHandle = () => {
    if(!file){
      alert('Please select a file to share');
      return;
    }
    else{
      setConnectControl(true);
    }
  }

  return (
    <>
    <Suspense fallback={<div className='h-screen flex justify-center align-middle items-center'>Loading...</div>}>
     <div className="min-w-[16rem] min-h-[10rem] bg-white shadow-2xl rounded-lg p-4 hover:bg-gray-300 hover:text-blue-300 text-white text-xl relative">
          <input
            type="file"
            className="hidden"
            id="fileInput"
            onChange={handleFileChange}
          />
          {previewUrl ? (
            <>
              {renderPreview()}
              <button
                onClick={() => {
                  setPreviewUrl('');
                  removeFile();
                  setFileName('');
                }}
                className="absolute top-2 right-2 bg-red-500 text-white p-1  hover:bg-red-600"
                title="Clear Preview"
              >
                ×
              </button>
            </>
          ) : (
            <label
              htmlFor="fileInput"
              className="flex justify-center items-center w-full h-full bg-gray-300 rounded-lg cursor-pointer hover:bg-white absolute top-0 left-0"
            >
              Upload File
            </label>
          )}
        </div>
        <div>
        {connectControl? (
          <Connect  />
        ):(
          <button onClick={shareHandle} className='bg-blue-100 pl-2 pr-2 rounded-2xl text-center text-white hover:text-blue-300 hover:bg-white'>Share</button>
        )}
        </div>
        </Suspense>
    </>
  );
}