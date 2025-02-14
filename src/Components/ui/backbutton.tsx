/* eslint-disable @next/next/no-html-link-for-pages */
import Image from 'next/image';
import BackIcon from '../../../public/Images/Back-icon.jpg'

export default function Backbutton(){
    return (
    <div className='absolute left-3 top-5 text-sm'>
        <a href="/">
        <Image src={BackIcon.src} alt="Back" className='object-cover max-w-10 max-h-10 hover:opacity-50' />
        </a>
    </div>
    );
};        
        