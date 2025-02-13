'use client'
import { useSearchParams } from 'next/navigation';
import '../globals.css'
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

interface connectProps{
  file: File| null;
}

const socket = io("http://localhost:5000");

const Connect : React.FC<connectProps> = ({file}) => {
  const searchParams = useSearchParams(); // Get query params
  const id = searchParams.get("id"); // Extract "id" from URL queryparams
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const dataChannel = useRef<RTCDataChannel | null>(null);
  const [roomId, setRoomId] = useState(id || "");
  const [joined, setJoined] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(file);
  const [downloadProgress, setDownloadProgress] = useState<number>(0); 

  const [isInitiator,setisInitiator] = useState<boolean>(id? false : true)


 
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
    createLink();
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
  
    let receivedMetadata: { name: string; type: string; size: number } | null = null;
    let receivedSize = 0; // Initialize receivedSize
  
    dataChannel.current.onopen = () => console.log("Data channel opened");
    dataChannel.current.onclose = () => console.log("Data channel closed");
  
    dataChannel.current.onmessage = (event) => {
      console.log("Receiving data...");
  
      // Check if the data is metadata (JSON) or file chunks (ArrayBuffer)
      if (typeof event.data === "string") {
        try {
          receivedMetadata = JSON.parse(event.data);
          console.log("Received file metadata:", receivedMetadata);
          setDownloadProgress(0); // Reset progress when new file starts
          receivedSize = 0; // Reset received size
        } catch (error) {
          console.error("Error parsing metadata:", error);
        }
      } else if (event.data instanceof ArrayBuffer && receivedMetadata) {
        console.log("Received file chunk, size:", event.data.byteLength, "bytes");
  
        receivedSize += event.data.byteLength; // Update received size
  
        // Update progress bar
        const progress = (receivedSize / receivedMetadata.size) * 100;
        setDownloadProgress(progress);
  
        if (receivedSize >= receivedMetadata.size) {
          // Convert received data into a Blob with correct MIME type
          const receivedBlob = new Blob([event.data], { type: receivedMetadata.type });
  
          // Create a download link
          const url = URL.createObjectURL(receivedBlob);
          const a = document.createElement("a");
          a.href = url;
          a.download = receivedMetadata.name; // Set correct filename
          document.body.appendChild(a);
          a.click(); // Automatically trigger download
          document.body.removeChild(a);
  
          // Free memory
          URL.revokeObjectURL(url);
          console.log("File download triggered!");
  
          // Reset metadata
          receivedMetadata = null;
        }
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
    //const CHUNK_SIZE = 16 * 1024 //16kb
    const fileMetadata =JSON.stringify({
        name: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size,
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


  const createLink = ()=>{
    const link = `http://localhost:3000/connect?id=${roomId}`
    try {
      navigator.clipboard.writeText(link);
      alert("Offer copied to clipboard");
    } catch (e) {
      console.error("Failed to copy to clipboard:", e);
      alert("Failed to copy offer to clipboard");

    }
  };


  return (
    <div className="flex flex-col items-center justify-center">
      {!joined ? (
        <div>
          <input
            type="text"
            placeholder="Enter Room ID"
            className="border p-2 rounded"
            id="fileInput"
            value={roomId}
            onChange={(e) => { setRoomId(e.target.value);
            }}
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
          {isInitiator? (<button onClick={sendFile} className="bg-green-500 text-white p-2 mt-2 rounded" >Send</button>) : (
            <>
             <p className='text-3xl font-semibold text-white'>FILE TRANSFER</p>
             {/* Progress Bar */}
             {downloadProgress > 0 && ( 
              <div className="w-full bg-gray-300 rounded h-4 mt-4">
                <div
                  className="bg-blue-500 h-4 rounded"
                  style={{ width: `${downloadProgress}%` }}
                ></div>
              </div>
             )} 
            {downloadProgress === 100 && <p className="mt-2 text-green-500">Download Complete!</p>}
            </>
            )}
        </div>
      )}
    </div>
  );
};

export default Connect;
