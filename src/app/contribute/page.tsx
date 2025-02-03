import '../globals.css'
import BackButton from '../Components/backbutton';
import grow from '../../../public/Images/grow.svg'

export default function Contribute(){
    return (
        <>
        <BackButton />
        <div className='flex flex-col justify-center align-middle items-center m-5'>
            <h1 className='text-3xl text-white font-bold mb-10'>Contribute</h1>
            <img src={grow.src} alt="" />
            <p className='text-lg text-white'>Help us grow by sharing this website with your peers</p>
            <p className='text-lg text-white'>Do you have issues or perhaps ideas to improve the platform?
            Words of feedback are very welcome!</p>
        </div>
        </>
    );
};