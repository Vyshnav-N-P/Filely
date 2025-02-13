'use client';

import '../globals.css'
import Image from 'next/image';
import BackButton from '../Components/backbutton';
import grow from '../../../public/Images/grow.svg'
import Paymentform from '../Components/paymentform';
import { useState } from 'react';

export default function Contribute(){
    const [paymentamount, setPaymentamount] = useState<number>(0);
    const [payment, setPayment] = useState(false);

    const handlePayment = ( amt: number) => {
        setPaymentamount(amt);
        setPayment(true);
    }
    return (
        <>
        <BackButton />
       
        <div className='flex flex-col justify-center align-middle items-center m-5'>
            <h1 className='text-3xl text-white font-bold mb-10'>Contribute</h1>
            <Image src={grow} alt='Growth'/>
            <p className='text-lg text-white'>Help us grow by sharing this website with your peers</p>
            <p className='text-lg text-white'>Do you have issues or perhaps ideas to improve the platform?
            Words of feedback are very welcome!</p>

            <h1 className='mt-5 text-3xl text-white font-semibold mb-10'>Tip Us</h1>
            <div className='flex flex-row justify-center align-middle items-center gap-5'>
                <button onClick={() =>{handlePayment(10)}} className='p-1 text-lg bg-slate-400 text-gray-600 rounded-lg hover:-translate-y-1 hover:drop-shadow-lg'>₹ 10</button>
                <button onClick={() =>{handlePayment(20)}} className='p-1 text-lg bg-slate-400 text-gray-600 rounded-lg hover:-translate-y-1 hover:drop-shadow-lg'>₹ 20</button>
                <button onClick={() =>{handlePayment(50)}} className='p-1 text-lg bg-slate-400 text-gray-600 rounded-lg hover:-translate-y-1 hover:drop-shadow-lg'>₹ 50</button>
                <button onClick={() =>{handlePayment(100)}} className='p-1 text-lg bg-slate-400 text-gray-600 rounded-lg hover:-translate-y-1 hover:drop-shadow-lg'>₹ 100</button>
            </div>
          
            <div className='m-1'>
            {payment &&<Paymentform amount={paymentamount} />}
            </div>
        </div>

        </>
    );
};