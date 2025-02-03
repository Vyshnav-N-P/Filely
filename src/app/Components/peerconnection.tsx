'use client';
import { useEffect , useRef , useState } from "react";
import '../globals.css';


export default function Peerconnection(){
     // Constants
    const FILE_INFO_PREFIX = "FILE_INFO:";
    const FILE_END_PREFIX = "FILE_END:";

    //Files
    const [isconnected,setisconnected] =useState(false);
    const [sendingfile,setsendingfile] = useState<File | null>(null);
    const [receiveFile,setreceivefile] = useState<string[]>([]);

    //Channels and Connections

    let localConnection = useRef <RTCPeerConnection | null> (null);
    let remoteConnection = useRef <RTCPeerConnection | null> (null);
    let sendchannel = useRef <RTCDataChannel | null> (null);
    let receivechannel = useRef< RTCDataChannel | null> (null);
    let filereader = useRef<FileReader | null >(null);
    
    //Functions

    const connect = async ()=>{
        // Creating peer connection
        localConnection.current = new RTCPeerConnection();
        remoteConnection.current = new RTCPeerConnection();

        // Creating data channels
        sendchannel.current = localConnection.current.createDataChannel('sendchannel');

        sendchannel.current.onopen = () => {setisconnected(true)}
        sendchannel.current.onclose = () => {setisconnected(false)}

         // Remote peer listens for incoming data channels
         remoteConnection.current.ondatachannel= (e) => {
            receivechannel.current = e.channel;
            receivechannel.current.onmessage = (e) => {
                setreceivefile(e.data); // Store received file data
            };

        receivechannel.current.onopen = () => console.log('Receive channel opened');
        receivechannel.current.onclose = () => console.log('Receive channel closed');
        
        };

        // Handle ICE candidates
        localConnection.current.onicecandidate = (e) => {
            if (!e.candidate) return ;
            remoteConnection.current?.addIceCandidate(e.candidate)
                .catch(err => console.error("Error adding candidate"));
        }
        remoteConnection.current.onicecandidate = (e) => {
            if (!e.candidate) return ;
            localConnection.current?.addIceCandidate(e.candidate)
                .catch(err => console.error("Error adding candidate"));
        }

        //Create SDP Offer/Answer
        try {
            const offer = await localConnection.current.createOffer();
            await localConnection.current.setLocalDescription(offer);
            await remoteConnection.current.setRemoteDescription(offer);

            const answer = await remoteConnection.current.createAnswer();
            await remoteConnection.current.setLocalDescription(answer);
            await localConnection.current.setRemoteDescription(answer);
        }
        catch(err) {
            console.error('Error creating connection:', err);
        }
    };
   
    const sendFile = async () => {
        if (!sendchannel.current || !sendingfile) return;
        const fileInfo = {
            name:sendingfile.name,
            type:sendingfile.type,
            size: sendingfile.size
        };
        
        sendchannel.current.send(FILE_INFO_PREFIX + JSON.stringify(fileInfo));

        //File reader
        filereader.current = new FileReader();
        let offset=0;
        filereader.current.addEventListener('load',(e) => {
            if(!sendchannel.current) return;
            offset += (e.target?.result as ArrayBuffer).byteLength;

        });

        };

    }

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
