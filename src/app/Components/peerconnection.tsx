'use client';
import { useEffect , useRef , useState } from "react";
import '../globals.css';


export default function Peerconnection(){

    //Files
    const [isconnected,setisconnected] =useState(true);
    const [sendFile,setsendfile] = useState();
    const [receiveFile,setreceivefile] = useState();

    //Channels and Connections

    let localConnection = useRef <RTCPeerConnection | null> (null);
    let remoteConnection = useRef <RTCPeerConnection | null> (null);
    let sendchannel = useRef <RTCDataChannel | null> (null);
    let receivechannel = useRef< RTCDataChannel | null> (null);
    
    //Functions

    const connect = async ()=>{
        // Creating peer connection
        localConnection.current = new RTCPeerConnection();
        remoteConnection.current = new RTCPeerConnection();

        // Creating data channels
        sendchannel.current = localConnection.current.createDataChannel('sendchannel');
        receivechannel.current = remoteConnection.current.createDataChannel('receivechannel');

        sendchannel.current.onopen = () => {setisconnected(true)}
        sendchannel.current.onclose = () => {setisconnected(false)}

    };
    
    const disconnect = ()=>{
        localConnection.current?.close();
        remoteConnection.current?.close();
        sendchannel.current?.close();
        receivechannel.current?.close();

        sendchannel.current=null;
        receivechannel.current=null;
        localConnection.current=null;
        remoteConnection.current=null;
        setisconnected(false);
    };
    return (
        <>

        </>
    );
 };
