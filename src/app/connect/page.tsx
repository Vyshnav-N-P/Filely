'use client';
import '../globals.css';
import copyicon from '../../../public/Images/copy-icon.png'
import { useState, useRef, useEffect } from "react";
import { io } from "socket.io-client"; // Import Socket.io client
import QRcode from "qrcode";
import BackButton from '../Components/backbutton';

export default function Connect() {
    const [copyUrl,setCopyUrl] = useState<string>('');
    const [qrCodeurl, setQrCodeurl] = useState<string>('');
    const [isConnected, setIsConnected] = useState(false);
    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const socket = useRef<any>(null);
    const isInitiator = useRef<boolean>(false);


    useEffect(() => {
        // Connect to the WebSocket signaling server
        socket.current = io("http://localhost:5000"); // Change this to your server URL if deployed

        // Handle incoming offers
        socket.current.on("offer", async (data: any) => {
            console.log("Received Offer:", data.offer);
            if (!peerConnection.current) createPeerConnection();

            await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(data.offer));
            const answer = await peerConnection.current?.createAnswer();
            await peerConnection.current?.setLocalDescription(answer);

            // Send answer back
            socket.current.emit("answer", { answer, to: data.from });
        });

        // Handle incoming answers
        socket.current.on("answer", async (data: any) => {
            console.log("Received Answer:", data.answer);
            await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(data.answer));
            setIsConnected(true);
        });

        // Handle incoming ICE candidates
        socket.current.on("icecandidate", async (data: any) => {
            console.log("Received ICE Candidate");
            await peerConnection.current?.addIceCandidate(new RTCIceCandidate(data.candidate));
        });

        return () => {
            socket.current.disconnect();
        };
    }, []);

    //Decoding if we got redirected from an offer
    useEffect(() => {

        const handleOffer= async()=> {
            const urlParams = new URLSearchParams(window.location.search);
            const offerparam = urlParams.get("offer");
            
            if (offerparam) {

                try {
                    isInitiator.current = false;
                    
                    const decodedparam = decodeURIComponent(offerparam);
                    const offer = JSON.parse(decodedparam);
                    console.log("Decoded Offer:", offer);

                    // If an offer is received, create the peer connection and send back an answer
                    if (!peerConnection.current) createPeerConnection();

                    await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(offer));

                    const answer =await  peerConnection.current?.createAnswer(); 
                    await peerConnection.current?.setLocalDescription(answer);

                    // Send answer back to the signaling server
                    if (socket.current) {
                        socket.current.emit("answer", { answer });
                        setIsConnected(true);
                    }


                } catch (error) {
                    console.error("Failed to decode offer:", error);
                }
            }
        };
        handleOffer();
    }, []);
  
    // Create Peer Connection
    const createPeerConnection = () => {
        peerConnection.current = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }], // Use Google's STUN server
        });

        peerConnection.current.onicecandidate = (event) => {
            if (event.candidate) {
                socket.current.emit("icecandidate", { candidate: event.candidate });
            }
        };
    };

    // Start the WebRTC Connection
    const startConnection = async () => {
        isInitiator.current = true;
        if (!peerConnection.current) createPeerConnection();

        const offer = await peerConnection.current?.createOffer();
        await peerConnection.current?.setLocalDescription(offer);
        
       //convert to encode
        const qrcodeData = JSON.stringify(offer);
        const encodeddata= encodeURIComponent(qrcodeData);
        const qrd = `http://localhost:3000/connect?offer=${encodeddata}`;
        const qrcode = await QRcode.toDataURL(qrd);
        setQrCodeurl(qrcode); 
        setCopyUrl(qrd)
       
        // Send offer to the signaling server
         socket.current.emit("offer", { offer });
    };

    // Disconnect WebRTC
    const disconnect = () => {
        peerConnection.current?.close();
        peerConnection.current = null;
        setIsConnected(false);
        socket.current.disconnect();
        setQrCodeurl("");
    };

    const copyToclipboard = () => {
        try {
            navigator.clipboard.writeText(copyUrl);
            alert("offer copied to clipboard");
        }catch (e) {
            console.error("Failed to copy to clipboard:", e);
            alert("Failed to copy offer to clipboard");
        }
       
    };
    return (
        <>
        <BackButton />
            <div className="flex justify-center align-middle items-center gap-10 h-screen">
            <button onClick={startConnection} className="p-3 text-2xl bg-white rounded-lg">Connect</button>
            {qrCodeurl && (
                <div className='flex flex-col align-middle justify-center items-center'>
                    <h2 className="text-white mt-4 text-lg font-semibold text-center">Scan this QR Code</h2>
                    <img src={qrCodeurl} alt="QR Code" className="w-80 h-80 mt-4" />
                    <button onClick={copyToclipboard} className='mt-3'>
                        <img src={copyicon.src} alt="" className='w-5 h-5 '/>
                    </button>
                </div>
            )}
            <button onClick={disconnect} className="p-3 text-2xl bg-white rounded-lg">Disconnect</button>
        </div>
        </>

    );
}
