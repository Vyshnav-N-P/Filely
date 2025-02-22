'use client'
import '../../app/globals.css'
import QRCode from "qrcode";
import { useState } from "react";
import Image from "next/image";
import { useRoomStore } from "@/stores/roomStore";

export default function QRCodeGenerator() {
    const [qrCodeurl, setQRCodeurl] = useState<string>('');
    const roomid = useRoomStore(state => state.ID);
    console.log(roomid);
    const generateQRCode = async () => {
    try {
        const url = await QRCode.toDataURL(`https://filely.netlify.app/connect?id=${roomid}`); // Change URL here
        setQRCodeurl(url);
        }   catch (error) {
        console.log(error);
    }}
    generateQRCode();
   
    return(
        <div className='flex flex-col justify-center items-center gap-4'>
        <Image src={qrCodeurl} alt="QR code " width={"100"} height={"100"}/>
        {/* <p>Scan to recieve</p> */}
        </div>
    );
}