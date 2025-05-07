import { useState } from "react";
import { motion } from "framer-motion";
import WaitlistForm from "@/components/WaitlistForm";
import SuccessMessage from "@/components/SuccessMessage";
import imageUrl from "@assets/20250507_0228_Elegant Parisian Stride_simple_compose_01jtm27fd3egwsr0chvwyq3fsw.png";

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
          <div className="text-4xl font-bold tracking-tight text-center mb-6 text-white">
            QudUP
          </div>
          
          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-center leading-tight mb-4">
            <span className="text-white">Garde une </span>
            <span className="text-[var(--gold)]">longueur d'avance.</span>
          </h1>
          
          {/* Email collection form */}
          <div className="w-full mt-8">
            <WaitlistForm onSuccess={handleFormSuccess} />
          </div>
          
          {/* Copyright */}
          <div className="mt-12 text-xs text-white/50 text-center">
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
