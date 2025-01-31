'use client';
import './globals.css';
import { useState } from 'react';


export default function Home() {
  const [File, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');  //for preview image
  const [fileName,Setfilename] = useState('');

  //Check file format
  const checkfile=(file:any) =>{
    console.log(file.type);
    if (file.type.match('image.*')) {
      return 'Image';
    } else if (file.type.match('audio.*')) {
      return 'Audio';
    } else if (file.type.match('application/pdf')) {
      return 'PDF';
    } else {
      return 'Unknown Format';
    }
  };
  
  //Handle file selections
  const handlefilechange = (e:any) =>{
    const file=e.target.files[0];
    setFile(file);
    console.log(file.type);
    if (file){
      Setfilename(file.name);
     
      console.log(file.size/1000 + "KB");
    };

    //Read file 
    const format = checkfile(file);
    console.log(format);
    const fr= new FileReader();
    fr.onload = () => {
      //if its a image file
      setPreviewUrl(fr.result);
    };
    fr.readAsDataURL(file);
  };


  return (
    <>
    <p className=' font-bold text-6xl text-white'>FILELY</p>
     <div className="flex min-h-screen justify-center items-center -translate-y-20 gap-10 ">
        <div className="w-64 h-40 bg-white shadow-2xl rounded-lg p-4 hover:bg-gray-300  hover:text-blue-300 text-white text-xl">
            <input type="file" className="hidden" id="fileInput" onChange={handlefilechange} />
             {previewUrl && <img src={previewUrl} alt="Preview"  className='w-full h-full object-cover rounded-lg'/>}
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