const ChunkFile= (
    file: File,
    chunkSize: number,
    onChunk: (chunk: ArrayBuffer, offset: number) => void,
    onComplete: () => void
  ) => {
    const reader = new FileReader();
    let offset = 0;
  
    reader.onload = (event) => {
      if (!event.target?.result) return;
      const arrayBuffer = event.target.result as ArrayBuffer;
  
      function sendChunk() {
        const chunk = arrayBuffer.slice(offset, offset + chunkSize);
        onChunk(chunk, offset);
        offset += chunkSize;
  
        if (offset < arrayBuffer.byteLength) {
          setTimeout(sendChunk, 50); // Prevent WebRTC buffer overflow
        } else {
          onComplete();
        }
      }
  
      sendChunk();
    };
  
    reader.readAsArrayBuffer(file);
  };

  export default ChunkFile;