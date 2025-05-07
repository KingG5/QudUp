import { AnimatePresence } from "framer-motion";

interface SuccessMessageProps {
  isVisible: boolean;
  onClose: () => void;
}

const SuccessMessage = ({ isVisible, onClose }: SuccessMessageProps) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <div
          className="fixed inset-0 bg-black/90 flex justify-center items-center flex-col z-[60]"
        >
          <div className="mb-6">
            <svg width="48" height="48" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="23" fill="none" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="2" />
              <circle 
                cx="24" 
                cy="24" 
                r="23" 
                fill="none" 
                stroke="white" 
                strokeWidth="2" 
              />
              <path 
                d="M12 24l8 8 16-16" 
                fill="none" 
                stroke="white" 
                strokeWidth="2" 
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-3 text-center text-white">Merci de votre inscription!</h2>
          <p className="text-sm max-w-sm text-center mb-8 text-white/80">
            Nous vous tiendrons informé dès que QudUP sera prêt à vous accueillir.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white text-black rounded-full text-sm font-medium transition-all duration-300 hover:bg-gray-200"
          >
            Fermer
          </button>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SuccessMessage;
