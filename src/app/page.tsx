"use client";
import { useEffect, useState, useRef } from "react";
import "./globals.css";

export default function Home() {
  const roomId = "filely-123"; // Static room ID (can be dynamic)
  const [peerConnection, setPeerConnection] =
    useState<RTCPeerConnection | null>(null);
  const [dataChannel, setDataChannel] = useState<RTCDataChannel | null>(null);
  const [status, setStatus] = useState<string>("Not connected");
  const [receivedFile, setReceivedFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    setPeerConnection(pc);

    pc.onicecandidate = async (event) => {
      if (event.candidate) {
        await fetch("/api/signaling", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomId,
            type: "candidate",
            data: event.candidate,
          }),
        });
      }
    };

    pc.ondatachannel = (event) => {
      const channel = event.channel;
      channel.binaryType = "arraybuffer";
      channel.onmessage = handleReceiveData;
      setDataChannel(channel);
      setStatus("Connected (Receiver)");
    };

    return () => {
      pc.close();
    };
  }, []);

  const handleReceiveData = (event: MessageEvent<ArrayBuffer>) => {
    const receivedBlob = new Blob([event.data]);
    const downloadUrl = URL.createObjectURL(receivedBlob);
    setReceivedFile(downloadUrl);
    setStatus("File received. Click to download.");
  };

  const createOffer = async () => {
    if (!peerConnection) return;

    const channel = peerConnection.createDataChannel("file-transfer");
    channel.binaryType = "arraybuffer";

    channel.onopen = () => setStatus("Connected (Sender)");
    channel.onmessage = handleReceiveData;
    setDataChannel(channel);

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    await fetch("/api/signaling", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId, type: "offer", data: offer }),
    });

    pollForRemoteSDP();
  };

  const acceptOffer = async () => {
    if (!peerConnection) return;

    const response = await fetch(`/api/signaling?roomId=${roomId}`);
    const data = await response.json();

    if (!data.offer) {
      console.error("No offer found");
      return;
    }

    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(data.offer)
    );
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    await fetch("/api/signaling", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId, type: "answer", data: answer }),
    });

    pollForRemoteSDP();
  };

  const pollForRemoteSDP = async () => {
    if (!peerConnection) return;

    const interval = setInterval(async () => {
      const response = await fetch(`/api/signaling?roomId=${roomId}`);
      const data = await response.json();

      if (data.answer) {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(data.answer)
        );
        clearInterval(interval);
      }

      if (data.candidates) {
        data.candidates.forEach((candidate: RTCIceCandidateInit) => {
          peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        });
      }
    }, 2000);
  };

  const sendFile = () => {
    if (!fileInputRef.current?.files?.[0]) {
      console.error("No file selected.");
      return;
    }
    if (!dataChannel || dataChannel.readyState !== "open") {
      console.error("DataChannel is not open.");
      return;
    }

    const file = fileInputRef.current.files[0];
    const reader = new FileReader();

    reader.readAsArrayBuffer(file);

    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        dataChannel.send(reader.result);
        setStatus("File sent!");
      } else {
        console.error("Failed to read file as ArrayBuffer.");
      }
    };

    reader.onerror = (error) => {
      console.error("FileReader error:", error);
    };
  };
  return (
    <>
      <div className="flex justify-between m-5">
        <p className="font-bold text-6xl text-white">FILELY</p>
        <div className="z-10 flex gap-20">
          <a
            href="/connect"
            className="text-white font-bold hover:border-t-4 text-xl pt-5"
          >
            Connect
          </a>
          <a
            href="/about"
            className="text-white font-bold hover:border-t-4 text-xl pt-5"
          >
            About Us
          </a>
          <a
            href="/contribute"
            className="text-white font-bold hover:border-t-4 text-xl pt-5"
          >
            Contribute
          </a>
        </div>
      </div>

      <div className="flex h-screen justify-center items-center -translate-y-20 gap-10">
        <div className="flex flex-col justify-center items-center align-middle gap-5">
          <input type="file" ref={fileInputRef} className="text-white" />
          <button
            onClick={sendFile}
            className="bg-blue-500 text-white p-2 rounded"
          >
            Send File
          </button>
          <button
            onClick={createOffer}
            className="bg-green-500 text-white p-2 rounded"
          >
            Start Sharing
          </button>
          <button
            onClick={acceptOffer}
            className="bg-purple-500 text-white p-2 rounded"
          >
            Join Sharing
          </button>

          {receivedFile && (
            <a href={receivedFile} download="received-file">
              <button className="bg-red-500 text-white p-2 rounded">
                Download File
              </button>
            </a>
          )}
        </div>

        <div className="flex flex-col align-middle items-center">
          <h3 className="text-white text-3xl">
            Share files directly from your device to anywhere
          </h3>
          <h4 className="text-white">
            Send files of any size directly from your device without ever
            storing anything online.
          </h4>
          <p className="text-white text-xl mt-4">Status: {status}</p>
        </div>
      </div>
    </>
  );
}
