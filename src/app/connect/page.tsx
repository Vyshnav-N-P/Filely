/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import '../globals.css';
import copyicon from '../../../public/Images/copy-icon.png';
import { useState, useRef, useEffect } from "react";
import { io } from "socket.io-client"; 
import QRcode from "qrcode";
import BackButton from '../Components/backbutton';

export default function Connect() {
    // States for URL copy functionality and QR code generation
    const [copyUrl, setCopyUrl] = useState<string>(''); 
    const [qrCodeurl, setQrCodeurl] = useState<string>(''); 
    const[sendid,setsendid] = useState<string>('');
    // State to track the connection status
    const [isConnected, setIsConnected] = useState(false); 

    // States for ICE candidate gathering
    const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);

    // Refs to manage WebRTC peer connection and other related objects
    const peerConnection = useRef<RTCPeerConnection | null>(null); 
    const socket = useRef<any>(null); // Socket instance for signaling
    const isInitiator = useRef<boolean>(true); // Tracks if the user is the initiator
    const dataChannel = useRef<RTCDataChannel | null>(null); // Data channel for peer-to-peer communication
    const clientId = useRef<string>(Math.random().toString(36).substring(7)); // Unique client ID generated for each client

    // Initialize socket connection and handle signaling messages
  
    useEffect (()=>{
      const initilizeSocket = () => {
        if (!socket.current) {
            socket.current = io("http://localhost:5000"); // Initialize socket connection only once
        }
    
        console.log("Client ID:", clientId.current);
    
        socket.current.on("offer", async (data: any) => {
            console.log("Received Offer:", data.offer);
            if (!peerConnection.current) createPeerConnection();
    
            try {
                await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(data.offer));
                const answer = await peerConnection.current?.createAnswer();
                await peerConnection.current?.setLocalDescription(answer);
                socket.current.emit("answer", { answer, to: data.from });
            } catch (err) {
                console.error("Error handling offer:", err);
            }
        });
    
        socket.current.on("answer", async (data: any) => {
            if (data.to === clientId.current) {
                console.log("Received Answer:", data.answer);
                await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(data.answer));
                
                   // Process any queued ICE candidates
            pendingCandidates.current.forEach(async (candidate) => {
                console.log("Adding queued ICE candidate:", candidate);
                await peerConnection.current?.addIceCandidate(new RTCIceCandidate(candidate));
            });
            pendingCandidates.current = []; // Clear queue after processing
            }
        });
    
        socket.current.on("icecandidate", async (data: any) => {
            if (data.to === clientId.current) {
                if (peerConnection.current?.remoteDescription) {
                    await peerConnection.current?.addIceCandidate(new RTCIceCandidate(data.candidate));
                } else {
                    console.log("Queuing ICE candidate");
                    pendingCandidates.current.push(data.candidate);
                }
            }
        });
    
        return () => {
            socket.current?.disconnect();
            console.log("Socket disconnected");
        };
    };
    initilizeSocket();
    },[]);

    useEffect(() => {
        const handleOffer = async () => {
            const urlParams = new URLSearchParams(window.location.search); // Get URL query parameters
            const offerparam = urlParams.get("offer"); // Get the offer parameter from the URL
            
            if (offerparam) {
                isInitiator.current = false; // Mark as not initiator
                

                try {
                    const decodedparam = decodeURIComponent(offerparam); // Decode the URL-encoded offer
                    const offer = JSON.parse(decodedparam); // Parse the decoded offer
                    console.log("Decoded Offer:", offer);

                    if (!peerConnection.current) createPeerConnection(); // Create peer connection if not already created

                    // Set remote description with the received offer
                    await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(offer.offer))
                   

                    // Create an answer to the offer
                    const answer = await peerConnection.current?.createAnswer();
                    await peerConnection.current?.setLocalDescription(answer);
                    socket.current.emit("answer", { answer, to: offer.from});
                    setsendid(offer.from)
                    console.log("Answer created "  + peerConnection.current?.remoteDescription?.type);
                    // Send the answer back to the signaling server
                  

                } catch (error) {
                    console.error("Failed to decode offer:", error);
                }
            }
        };

        handleOffer(); // Call the function to handle incoming offer on mount
    }, []);

    // Function to create a peer connection and data channel
    const createPeerConnection = () => {
        peerConnection.current = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }], // STUN server for ICE candidate gathering
        });

        // Handle ICE candidates from the peer connection
        peerConnection.current.onicecandidate = async (event) => {
            if (event.candidate ){ 
                if(peerConnection.current?.remoteDescription) {
                console.log("Sending ICE Candidate:", event.candidate);
                socket.current.emit("icecandidate", { candidate: event.candidate, to: clientId.current });
            }else{
                console.log("RemoteDiscription not yet set m queueing Icecandidate:", event);
                pendingCandidates.current.push(event.candidate);
            }  
        }
        };

         // Check if this is the **initiator**
    if (isInitiator.current) {
      // **Only initiator should create a data channel**
      dataChannel.current = peerConnection.current.createDataChannel("Chat");

      setupDataChannel(dataChannel.current);
  } else {
      // **Non-initiator listens for data channel**
      peerConnection.current.ondatachannel = (event) => {
          dataChannel.current = event.channel;
          setupDataChannel(dataChannel.current);
      };
  }
};

// Function to handle DataChannel events
const setupDataChannel = (channel: RTCDataChannel) => {
  channel.onopen = () => {
      console.log("Data Channel Opened ✅");
      channel.send("Connection established! 🎉");
  };

  channel.onmessage = (event) => {
      console.log("📩 Received:", event.data);
  };

  channel.onerror = (error) => {
      console.error("❌ Data Channel Error:", error);
  };

  channel.onclose = () => {
      console.log("Data Channel Closed ❌");
  };
};

   // Function to start a new connection by sending an offer

  const startConnection = async () => {
     // Ensure socket is initialized

    if (isInitiator.current) {
        // Initiator logic: create offer and QR code
        if (!peerConnection.current) createPeerConnection(); // Ensure peer connection is created

        try {
            const offer = await peerConnection.current?.createOffer();
            await peerConnection.current?.setLocalDescription(offer);

            const qrcodeData = JSON.stringify({ offer, from: clientId.current });
            const encodedData = encodeURIComponent(qrcodeData);
            const qrd = `http://localhost:3000/connect?offer=${encodedData}`;
            const qrcode = await QRcode.toDataURL(qrd);

            setQrCodeurl(qrcode);
            setCopyUrl(qrd);

            socket.current.emit("offer", { offer, from: clientId.current });

            if (dataChannel.current?.readyState === "open") {
                dataChannel.current.send("Hello from Initiator");
            }
        } catch (err) {
            console.error("Failed to start connection:", err);
            alert("Error starting the connection");
        }
    } else {
        // Non-initiator: Ensure answer is sent if an offer is received
        if (peerConnection.current?.remoteDescription) {
            try {
                const answer = peerConnection.current?.localDescription?.sdp;
                console.log ("Creating Answer for the offer :"+ answer + peerConnection.current.remoteDescription.sdp)
                socket.current.emit("answer", { answer, to: sendid});
                setIsConnected(true);
            } catch (err) {
                console.error("Failed to send answer:", err);
                alert("Error sending answer");
            }
        } else {
            alert("No offer received yet. Wait for the initiator to send an offer.");
        }
    }
};


    // Function to disconnect the connection
    const disconnect = () => {
        // Close the peer connection and reset state
        peerConnection.current?.close();
        peerConnection.current = null;
        setIsConnected(false);
        socket.current.disconnect(); // Disconnect from the signaling server
        setQrCodeurl(""); // Clear the QR code URL
    };

    // Function to copy the offer URL to clipboard
    const copyToClipboard = () => {
        try {
            navigator.clipboard.writeText(copyUrl); // Write the URL to clipboard
            alert("Offer copied to clipboard");
        } catch (e) {
            console.error("Failed to copy to clipboard:", e);
            alert("Failed to copy offer to clipboard");
        }
    };

    return (
        <>
            <BackButton />
            <div className="flex justify-center align-middle items-center gap-10 h-screen">
                {/* Button to start a new connection */}
                
                <button onClick={startConnection} className="p-3 text-2xl bg-green-400 rounded-lg">Connect</button>

                {/* Display QR code and copy button if available */}
                {qrCodeurl && (
                    <div className='flex flex-col align-middle justify-center items-center'>
                        <h2 className="text-white mt-4 text-lg font-semibold text-center">Scan this QR Code</h2>
                        <img src={qrCodeurl} alt="QR Code" className="w-80 h-80 mt-4" />
                        <button onClick={copyToClipboard} className='mt-3'>
                            <img src={copyicon.src} alt="" className='w-5 h-5' />
                        </button>
                    </div>
                )}

                {/* Button to disconnect the connection */}
                <button onClick={disconnect} className="p-3 text-2xl bg-red-400 rounded-lg">Disconnect</button>
            </div>
        </>
    );
}
