'use client';
import { useEffect, useRef, useState } from "react";
import '../globals.css';

interface FileInfo {
  name: string;
  type: string;
  size: number;
}

export default function PeerConnection() {
  // Constants
  const FILE_INFO_PREFIX = "FILE_INFO:";
  const FILE_END_PREFIX = "FILE_END:";

  // State management
  const [isConnected, setIsConnected] = useState(false);
  const [sendingFile, setSendingFile] = useState<File | null>(null);
  const [receivedFiles, setReceivedFiles] = useState<FileInfo[]>([]);
  const [receivedFileData, setReceivedFileData] = useState<string[]>([]);

  // Refs for WebRTC connections and channels
  const localConnection = useRef<RTCPeerConnection | null>(null);
  const remoteConnection = useRef<RTCPeerConnection | null>(null);
  const sendChannel = useRef<RTCDataChannel | null>(null);
  const receiveChannel = useRef<RTCDataChannel | null>(null);
  const fileReader = useRef<FileReader | null>(null);

  // Connect to peer
  const connect = async () => {
    try {
      // Create peer connections
      localConnection.current = new RTCPeerConnection();
      remoteConnection.current = new RTCPeerConnection();

      // Create send data channel
      sendChannel.current = localConnection.current.createDataChannel('sendChannel');

      // Channel event handlers
      sendChannel.current.onopen = () => setIsConnected(true);
      sendChannel.current.onclose = () => setIsConnected(false);

      // Remote peer data channel handler
      remoteConnection.current.ondatachannel = (event) => {
        receiveChannel.current = event.channel;
        
        // Handle incoming messages
        receiveChannel.current.onmessage = handleIncomingMessage;
        
        receiveChannel.current.onopen = () => console.log('Receive channel opened');
        receiveChannel.current.onclose = () => console.log('Receive channel closed');
      };

      // ICE candidate handling
      localConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          remoteConnection.current?.addIceCandidate(event.candidate)
            .catch(err => console.error("Error adding local ICE candidate:", err));
        }
      };

      remoteConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          localConnection.current?.addIceCandidate(event.candidate)
            .catch(err => console.error("Error adding remote ICE candidate:", err));
        }
      };

      // Create and exchange offer/answer
      const offer = await localConnection.current.createOffer();
      await localConnection.current.setLocalDescription(offer);
      await remoteConnection.current.setRemoteDescription(offer);

      const answer = await remoteConnection.current.createAnswer();
      await remoteConnection.current.setLocalDescription(answer);
      await localConnection.current.setRemoteDescription(answer);

    } catch (error) {
      console.error('Connection setup error:', error);
      setIsConnected(false);
    }
  };

  // Handle incoming messages
  const handleIncomingMessage = (event: MessageEvent) => {
    const message = event.data;

    // Check if it's a file info message
    if (message.startsWith(FILE_INFO_PREFIX)) {
      const fileInfo: FileInfo = JSON.parse(message.slice(FILE_INFO_PREFIX.length));
      setReceivedFiles(prev => [...prev, fileInfo]);
    } 
    // Check if it's file data
    else if (message.startsWith(FILE_END_PREFIX)) {
      // Handle file completion
      console.log('File transfer complete');
    } 
    else {
      // Regular file data
      setReceivedFileData(prev => [...prev, message]);
    }
  };

  // Send file method
  const sendFile = async () => {
    if (!sendingFile || !sendChannel.current || !isConnected) return;

    try {
      // Send file info
      const fileInfo: FileInfo = {
        name: sendingFile.name,
        type: sendingFile.type,
        size: sendingFile.size
      };
      sendChannel.current.send(FILE_INFO_PREFIX + JSON.stringify(fileInfo));

      // Read and send file in chunks
      fileReader.current = new FileReader();
      const chunkSize = 16 * 1024; // 16KB chunks

      fileReader.current.onload = (event) => {
        if (sendChannel.current && event.target?.result) {
          sendChannel.current.send(event.target.result as ArrayBuffer);
        }
      };

      // Read file in chunks
      const readNextChunk = (start: number) => {
        const slice = sendingFile.slice(start, start + chunkSize);
        if (slice.size > 0) {
          fileReader.current?.readAsArrayBuffer(slice);
        } else {
          // Send file end marker
          sendChannel.current?.send(FILE_END_PREFIX);
        }
      };

      readNextChunk(0);

    } catch (error) {
      console.error('File send error:', error);
    }
  };

  // Disconnect method
  const disconnect = () => {
    localConnection.current?.close();
    remoteConnection.current?.close();
    sendChannel.current?.close();
    receiveChannel.current?.close();

    // Reset all connections and state
    localConnection.current = null;
    remoteConnection.current = null;
    sendChannel.current = null;
    receiveChannel.current = null;

    setIsConnected(false);
    setReceivedFiles([]);
    setReceivedFileData([]);
  };

  // UI and file selection (you'll need to implement this)
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSendingFile(file);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileSelect} />
      <button onClick={connect} disabled={isConnected}>Connect</button>
      <button onClick={sendFile} disabled={!isConnected || !sendingFile}>Send File</button>
      <button onClick={disconnect} disabled={!isConnected}>Disconnect</button>
      
      <div>
        <h3>Received Files:</h3>
        {receivedFiles.map((file, index) => (
          <div key={index}>
            <p>Name: {file.name}</p>
            <p>Type: {file.type}</p>
            <p>Size: {file.size} bytes</p>
          </div>
        ))}
      </div>
    </div>
  );
}