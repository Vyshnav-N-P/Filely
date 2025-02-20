import "../globals.css";
import BackButton from "../../Components/ui/backbutton";

export default function About() {
  return (
    <>
      <BackButton />
      <div className="bg-gray-500 flex flex-col items-center justify-center min-h-screen px-4 py-10">
        <div className="max-w-4xl w-full">
          <p className="text-3xl sm:text-4xl md:text-5xl text-white text-center font-bold mb-6">
            About Us
          </p>
          <p className="text-base sm:text-lg md:text-xl text-white text-center leading-relaxed">
            Welcome to <span className="font-semibold">FILELY</span>, a project developed by
            <span className="font-semibold"> Vyshnav NP</span> and{" "}
            <span className="font-semibold">Jacob Cyril</span> with the vision of simplifying file sharing. Our platform allows users to transfer files of any size seamlessly, without the need for cloud storage.
            <br /><br />
            We prioritize <span className="font-semibold">speed, security, and ease of use</span>, ensuring that your files reach their destination without any hassle.
            <br /><br />
            With a passion for innovation and technology, we have built FILELY to provide a reliable and efficient solution for sharing files directly from your device. Whether it is images, documents, or audio files, our platform ensures a smooth and hassle-free experience.
            <br /><br />
            Thank you for being a part of our journey. Stay connected and share effortlessly with FILELY!
          </p>
        </div>
      </div>
    </>
  );
}
