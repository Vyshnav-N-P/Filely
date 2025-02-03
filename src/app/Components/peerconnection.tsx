'use client';
import { useEffect , useRef , useState } from "react";
import '../globals.css';


export default function Peerconnection(){
    
    //Files
    const [isconnected,setisconnected] =useState();
    const [sendFile,setsendfile] = useState();
    const [receiveFile,setreceivefile] = useState();

    //Channels and Connections

    let localConnection = useRef(null);
    let remoteConnection = useRef(null);
    let sendchannel = useRef(null);
    let receivechannel = useRef(null);
    
    return (
        <>

        </>
    );
 };
