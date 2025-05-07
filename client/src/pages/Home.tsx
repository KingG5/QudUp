import { useState } from "react";
import WaitlistForm from "@/components/WaitlistForm";
import SuccessMessage from "@/components/SuccessMessage";
import imageUrl from "@assets/20250507_0228_Elegant Parisian Stride_simple_compose_01jtm27fd3egwsr0chvwyq3fsw.png";
import { FaInstagram } from "react-icons/fa";

const Home = () => {
  const [showSuccess, setShowSuccess] = useState(false);

  const handleFormSuccess = () => {
    setShowSuccess(true);
  };

  const closeSuccessMessage = () => {
    setShowSuccess(false);
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Full-page background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70 z-10"></div>

      {/* Main content */}
      <div className="relative z-20 h-full w-full flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full flex flex-col items-center">
          {/* Logo/Brand */}
          <div className="text-5xl tracking-tight text-center mb-6 text-white font-anton">
            QudUP
          </div>
          
          {/* Title - Now in uppercase */}
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-center leading-tight mb-4">
            <span className="text-white uppercase">GARDE UNE LONGUEUR D'AVANCE</span>
          </h1>
          
          {/* Email collection form */}
          <div className="w-full mt-8">
            <WaitlistForm onSuccess={handleFormSuccess} />
          </div>
          
          {/* Social links */}
          <div className="mt-6">
            <a 
              href="https://www.instagram.com/qud.up/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white hover:text-gray-300 transition-colors"
              aria-label="Instagram"
            >
              <FaInstagram size={24} />
            </a>
          </div>
          
          {/* Copyright */}
          <div className="mt-6 text-xs text-white/50 text-center">
            &copy; {new Date().getFullYear()} QudUP. Tous droits réservés.
          </div>
        </div>
      </div>

      {/* Success message */}
      <SuccessMessage isVisible={showSuccess} onClose={closeSuccessMessage} />
    </div>
  );
};

export default Home;
