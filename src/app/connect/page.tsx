'use client'
import '../globals.css'
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

const Connect = () => {
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const dataChannel = useRef<RTCDataChannel | null>(null);
  const [roomId, setRoomId] = useState("");
  const [joined, setJoined] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);


  useEffect(() => {
    socket.on("user-joined", async (userId) => {
      console.log("User joined:", userId);
      await createOffer(userId);
    });

    socket.on("offer", async ({ sender, offer }) => {
      console.log("Received offer from", sender);
      await handleOffer(sender, offer);
    });

    socket.on("answer", async ({ sender, answer }) => {
      console.log("Received answer from", sender);
      await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on("ice-candidate", async ({ sender, candidate }) => {
      if (candidate) {
        console.log("Received ICE candidate:", candidate + "from " + sender);
        await peerConnection.current?.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    return () => {
      socket.off("user-joined");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
    };
  }, []);

  const joinRoom = async () => {
    if (!roomId) return;
    socket.emit("join-room", roomId);
    setJoined(true);
    createPeerConnection();
  };

  const createPeerConnection = () => {
    peerConnection.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });

    dataChannel.current = peerConnection.current.createDataChannel("fileTransfer");
    setupDataChannel();

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { target: roomId, candidate: event.candidate });
      }
    };

    peerConnection.current.ondatachannel = (event) => {
      console.log("Received data channel");
      dataChannel.current = event.channel;
      setupDataChannel();
    };
  };

  
  const setupDataChannel = () => {
    if (!dataChannel.current) return;
  
    let receivedMetadata: { name: string; type: string } | null = null;
  
    dataChannel.current.onopen = () => console.log("Data channel opened");
    dataChannel.current.onclose = () => console.log("Data channel closed");
  
    dataChannel.current.onmessage = (event) => {
      console.log("Receiving data...");
  
      // Check if the data is a JSON string (metadata) or a file (ArrayBuffer)
      if (typeof event.data === "string") {
        try {
          receivedMetadata = JSON.parse(event.data);
          console.log("Received file metadata:", receivedMetadata);
        } catch (error) {
          console.error("Error parsing metadata:", error);
        }
      } else if (event.data instanceof ArrayBuffer && receivedMetadata) {
        console.log("Received file as ArrayBuffer, size:", event.data.byteLength, "bytes");
  
        // Convert ArrayBuffer to Blob with correct MIME type
        const receivedBlob = new Blob([event.data], { type: receivedMetadata.type });
  
        // Create a download link with the correct filename
        const url = URL.createObjectURL(receivedBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = receivedMetadata.name; // Set correct filename
        document.body.appendChild(a);
        a.click(); // Automatically trigger download
        document.body.removeChild(a);
  
        // Free up memory
        URL.revokeObjectURL(url);
        console.log("File download triggered with correct format!");
  
        // Reset metadata
        receivedMetadata = null;
      } else {
        console.error("Unexpected data format received:", event.data);
      }
    };
  };
  

  const createOffer = async (userId: string) => {
    if (!peerConnection.current) return;
    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);
    socket.emit("offer", { target: userId, offer });
  };

  const handleOffer = async (sender: string, offer: RTCSessionDescriptionInit) => {
    if (!peerConnection.current) {
      createPeerConnection();
    }

    if (!peerConnection.current) return;

    await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.current.createAnswer();
    await peerConnection.current.setLocalDescription(answer);
    socket.emit("answer", { target: sender, answer });
  };

  const sendFile = () => {
    if (!dataChannel.current || dataChannel.current.readyState !== "open") {
      console.error("Data channel is not open " + dataChannel.current?.readyState);
      return;
    }
    if (!selectedFile) return;

    const fileMetadata =JSON.stringify({
        name: selectedFile.name,
        type: selectedFile.type
    });

    dataChannel.current?.send(fileMetadata);
    console.log("Sending file:", selectedFile.name);
    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      dataChannel.current?.send(arrayBuffer);
      console.log("File sent successfully!");
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handlefilechange=(event: React.ChangeEvent<HTMLInputElement>) => {
    const fileInput = event.target.files?.[0];
    console.log("File changed to ", fileInput?.name);
    if (!fileInput) return;
    setSelectedFile(fileInput);
  };
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      {!joined ? (
        <div>
          <input
            type="text"
            placeholder="Enter Room ID"
            className="border p-2 rounded"
            id="fileInput"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
          <button
            onClick={joinRoom}
            className="bg-blue-500 text-white p-2 ml-2 rounded"
          >
            Join Room
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <input type="file" onChange={handlefilechange} className="mt-4 p-2 border" />
          <button onClick={sendFile} className="bg-green-500 text-white p-2 mt-2 rounded" >Send</button>
        </div>
      )}
    </div>
  );
};

export default Connect;
