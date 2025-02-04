'use client';
import '../globals.css';
import { useState, useRef, useEffect } from "react";
import { io } from "socket.io-client"; // Import Socket.io client

export default function Connect() {
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

        // Send offer to the signaling server
        socket.current.emit("offer", { offer });
    };

    // Disconnect WebRTC
    const disconnect = () => {
        peerConnection.current?.close();
        peerConnection.current = null;
        setIsConnected(false);
        socket.current.disconnect();
    };

    return (
        <div className="flex justify-center align-middle items-center gap-10 h-screen">
            <button onClick={startConnection} className="p-3 text-2xl bg-white rounded-lg">Connect</button>
            <button onClick={disconnect} className="p-3 text-2xl bg-white rounded-lg">Disconnect</button>
        </div>
    );
}
