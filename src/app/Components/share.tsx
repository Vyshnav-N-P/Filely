'use client';
import '../globals.css'
import { useState , useEffect ,useRef } from 'react';
import io from 'socket.io-client';
import Peer from 'simple-peer';

export default function Share(){
    //Show Send and Cancel button After Peerconncetion ,later to qr code
    const [showControl,setshowcontrol] = useState(false);


    return (
        <>
            <div>
                {showControl? (
                    <div className='flex justify-between gap-10'>
                    <button className='bg-blue-100 pl-3 pr-3 rounded-2xl text-center text-white hover:text-blue-300 hover:bg-white' >Send</button>
                    <button onClick={()=> {setshowcontrol(false)}} className='bg-blue-100 pl-2 pr-2 rounded-2xl text-center text-white hover:text-blue-300 hover:bg-white' >Cancel</button>
                    </div>
                ):(
                <button onClick={()=>{setshowcontrol(true)}} className='bg-blue-100 pl-2 pr-2 rounded-2xl text-center text-white hover:text-blue-300 hover:bg-white'>Share</button>
                )}
            </div>
        </>
    );
};