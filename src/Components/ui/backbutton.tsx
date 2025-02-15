/* eslint-disable @next/next/no-html-link-for-pages */
import Image from 'next/image';
import BackIcon from '../../../public/Images/Back-icon.jpg'

export default function Backbutton(){
    return (
    <div className='absolute left-3 top-5 text-sm'>
        <a href="/">
        <Image src={BackIcon.src} alt="Back" className='object-cover hover:opacity-50' width="20" height="20"/>
        </a>
    </div>
    );
};        
        