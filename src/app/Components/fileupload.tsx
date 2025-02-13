/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import '../globals.css';
import pdfimage from '../../../public/Images/pdf-ICON.png';
import audioimage from '../../../public/Images/audio-icon.png';
import { useState } from 'react';
import Connect from '../connect/page';

//import Connect from '../connect/page';

export default function Fileupload() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<any>(''); // For preview image
  const [fileName, setFileName] = useState('');
  const [connectControl, setConnectControl] = useState<boolean>(false);
  
  // Handle file selection
  const handleFileChange = (e:any) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setFileName(selectedFile.name);

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
          <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-lg items-center"  />;
          <p className="text-black text-sm">{fileName}</p>
        </div>
      );
    } else if (file.type.match('audio.*')) {
      return (
      <div className='w-52 h-80 flex flex-col justify-center items-center align-middle bg-gray-200 rounded-lg gap-2'>
        <img src={audioimage.src} alt="Audio Icon" className="w-16 h-16" />
        <audio controls src={previewUrl} className="w-full h-10" />
        <p className="text-black text-sm">{fileName}</p>
      </div>
      
    );
    } else if (file.type.match('application/pdf')) {
      return (
        <div className="w-52 h-80 flex flex-col justify-center items-center align-middle bg-gray-200 rounded-lg">
          <img src={pdfimage.src} alt="PDF Icon" className="w-full h-full object-cover" />
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
                  setFile(null);
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
          <Connect fileSelected = {file} />
        ):(
          <button onClick={shareHandle} className='bg-blue-100 pl-2 pr-2 rounded-2xl text-center text-white hover:text-blue-300 hover:bg-white'>Share</button>
        )}
        </div>
    </>
  );
}