'use client'

import { QRCode } from "qrcode";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function QRCodeGenerator() {
    const [qrCode, setQRCode] = useState<string>('');

    useEffect(()=>{
        try {
            
        } catch (error) {
            
        }
    },[])
    return(
        <>
        <Image src={qrCode}/>
        
        </>
    );
}