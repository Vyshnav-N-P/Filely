'use client';
import '../globals.css'
import BackButton from '../Components/backbutton';
import grow from '../../../public/Images/grow.svg'
import PaymentSystem from '../Components/paymentSystem';
import { useState } from 'react';

export default function Contribute(){
    const [payment, setPayment] = useState(false);
    return (
        <>
        <BackButton />
       
        <div className='flex flex-col justify-center align-middle items-center m-5'>
            <h1 className='text-3xl text-white font-bold mb-10'>Contribute</h1>
            <img src={grow.src} alt="" />
            <p className='text-lg text-white'>Help us grow by sharing this website with your peers</p>
            <p className='text-lg text-white'>Do you have issues or perhaps ideas to improve the platform?
            Words of feedback are very welcome!</p>

            <h1 className='mt-5 text-3xl text-white font-semibold mb-10'>Tip Us</h1>
            <div className='flex flex-row justify-center align-middle items-center gap-5'>
                <button onClick={() =>{setPayment(true)}} className='p-1 text-lg bg-slate-400 text-gray-600 rounded-lg hover:-translate-y-1 hover:drop-shadow-lg'>₹ 10</button>
                <button className='p-1 text-lg bg-slate-400 text-gray-600 rounded-lg hover:-translate-y-1 hover:drop-shadow-lg'>₹ 20</button>
                <button className='p-1 text-lg bg-slate-400 text-gray-600 rounded-lg hover:-translate-y-1 hover:drop-shadow-lg'>₹ 50</button>
                <button className='p-1 text-lg bg-slate-400 text-gray-600 rounded-lg hover:-translate-y-1 hover:drop-shadow-lg'>₹ 100</button>

            </div>

            {payment && (
            <div className=''>
                <PaymentSystem />
            </div>
        )}
        
        </div>
        </>
    );
};