'use client'
import '../../app/globals.css'
import QRCode from "qrcode";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRoomStore } from "@/stores/roomStore";

export default function QRCodeGenerator() {
    const [qrCode, setQRCode] = useState<string>('');
    const roomid = useRoomStore(state => state.ID);
    useEffect(()=>{
        const generateQRCode = async () => {
        try {
            const url = await QRCode.toDataURL(`https://filely.netlify.app/connect?id=${roomid}`); // Change URL here
            setQRCode(url);
            }   catch (error) {
            console.log(error);
        }}
        generateQRCode();
    },[])
    return(
        <div className='flex flex-col justify-center items-center gap-4'>
        <Image src={qrCode} alt="QR code "/>
        <p>Scan to recieve</p>
        </div>
    );
}