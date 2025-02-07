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

    // State to track the connection status
    const [isConnected, setIsConnected] = useState(false); 

    // Refs to manage WebRTC peer connection and other related objects
    const peerConnection = useRef<RTCPeerConnection | null>(null); 
    const socket = useRef<any>(null); // Socket instance for signaling
    const isInitiator = useRef<boolean>(false); // Tracks if the user is the initiator
    const dataChannel = useRef<RTCDataChannel | null>(null); // Data channel for peer-to-peer communication
    const clientId = useRef<string>(Math.random().toString(36).substring(7)); // Unique client ID generated for each client

    // Initialize socket connection and handle signaling messages
    const initilizeSocket = () => {
        socket.current = io("http://localhost:5000"); // Connect to the signaling server

        console.log(clientId); // Log the unique client ID

        // Handle incoming offer
        socket.current.on("offer", async (data: any) => {
            console.log("Received Offer:", data.offer);
            if (!peerConnection.current) createPeerConnection(); // Create peer connection if it doesn't exist

            try {
                // Set the remote offer description
                await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(data.offer));

                // Create an answer to the offer
                const answer = await peerConnection.current?.createAnswer();
                console.log(answer);
                await peerConnection.current?.setLocalDescription(answer);

                // Send the answer back to the signaling server
                socket.current.emit("answer", { answer, to: data.from });

            } catch (err) {
                console.log(err);
            }
        });

        // Handle incoming answer
        socket.current.on("answer", async (data: any) => {
            if (data.to === clientId.current) {
                console.log("Received Answer:", data.answer);
                await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(data.answer));
                setIsConnected(true); // Update the connection status to true
            }
        });

        // Handle incoming ICE candidates
        socket.current.on("icecandidate", async (data: any) => {
            if (data.to === clientId.current) {
                console.log("Received ICE Candidate");
                await peerConnection.current?.addIceCandidate(new RTCIceCandidate(data.candidate));
            }
        });

        return () => {
            socket.current.disconnect(); // Disconnect socket when the component unmounts
        };
    };

    useEffect(() => {
        const handleOffer = async () => {
            const urlParams = new URLSearchParams(window.location.search); // Get URL query parameters
            const offerparam = urlParams.get("offer"); // Get the offer parameter from the URL

            if (offerparam) {
                isInitiator.current = false; // Mark as not initiator
                initilizeSocket(); // Initialize socket connection

                try {
                    const decodedparam = decodeURIComponent(offerparam); // Decode the URL-encoded offer
                    const offer = JSON.parse(decodedparam); // Parse the decoded offer
                    console.log("Decoded Offer:", offer);

                    if (!peerConnection.current) createPeerConnection(); // Create peer connection if not already created

                    // Set remote description with the received offer
                    await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(offer.offer));

                    // Create an answer to the offer
                    const answer = await peerConnection.current?.createAnswer();
                    await peerConnection.current?.setLocalDescription(answer);

                    // Send the answer back to the signaling server
                    socket.current.emit("answer", { answer, to: offer.from });
                    setIsConnected(true); // Set connection status to true

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
            if (event.candidate && peerConnection.current?.remoteDescription) {
                console.log("Sending ICE Candidate:", event.candidate);
                socket.current.emit("icecandidate", { candidate: event.candidate, to: clientId.current });
            }
        };

        // Create a data channel for peer-to-peer communication
        dataChannel.current = peerConnection.current?.createDataChannel("Chat");

        // Handle data channel open event
        dataChannel.current.onopen = () => {
            console.log("Data Channel Opened");
        };

        // Handle incoming messages on the data channel
        dataChannel.current.onmessage = (event) => {
            console.log("Received Message:", event.data);
        };

        // Handle data channel errors
        dataChannel.current.onerror = (error) => {
            console.error("Data Channel Error:", error);
        };

        // Handle data channel close event
        dataChannel.current.onclose = () => {
            console.log("Data Channel Closed");
        };
    };

    // Function to start a new connection by sending an offer
    const startConnection = async () => {
        isInitiator.current = true; // Mark as the initiator
        initilizeSocket(); // Initialize socket connection
        if (!peerConnection.current) createPeerConnection(); // Create peer connection if not already created

        // Create an offer to send to the peer
        const offer = await peerConnection.current?.createOffer();
        console.log(offer);
        await peerConnection.current?.setLocalDescription(offer);

        // Prepare QR code data with offer
        const qrcodeData = JSON.stringify({ offer, from: clientId.current });
        const encodeddata = encodeURIComponent(qrcodeData);
        const qrd = `http://localhost:3000/connect?offer=${encodeddata}`;
        const qrcode = await QRcode.toDataURL(qrd); // Generate QR code
        setQrCodeurl(qrcode); // Set the generated QR code URL
        setCopyUrl(qrd); // Set the URL for copying to clipboard

        // Send the offer to the signaling server
        socket.current.emit("offer", { offer, from: clientId.current });

        // If data channel is open, send a message
        if (dataChannel.current?.readyState === "open") {
            dataChannel.current.send("Hello from Initiator");
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
                <button onClick={startConnection} className="p-3 text-2xl bg-white rounded-lg">Connect</button>

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
                <button onClick={disconnect} className="p-3 text-2xl bg-white rounded-lg">Disconnect</button>
            </div>
        </>
    );
}
