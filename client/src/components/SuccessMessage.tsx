import { motion, AnimatePresence } from "framer-motion";

interface SuccessMessageProps {
  isVisible: boolean;
  onClose: () => void;
}

const SuccessMessage = ({ isVisible, onClose }: SuccessMessageProps) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 bg-black/90 flex justify-center items-center flex-col z-[60] transition-all duration-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="checkmark w-20 h-20 mb-8">
            <svg viewBox="0 0 52 52">
              <circle cx="26" cy="26" r="25" fill="none" stroke="rgba(212, 175, 55, 0.2)" strokeWidth="2" />
              <motion.circle 
                cx="26" 
                cy="26" 
                r="25" 
                fill="none" 
                stroke="#D4AF37" 
                strokeWidth="2" 
                strokeDasharray="157" 
                initial={{ strokeDashoffset: 157 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 1 }}
              />
              <motion.path 
                d="M14.1 27.2l7.1 7.2 16.7-16.8" 
                fill="none" 
                stroke="#D4AF37" 
                strokeWidth="2" 
                strokeDasharray="100"
                initial={{ strokeDashoffset: 100 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </svg>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">Merci de votre inscription!</h2>
          <p className="text-base max-w-md text-center mb-10">
            Nous vous tiendrons informé dès que QudUP sera prêt à vous accueillir.
          </p>
          <button
            onClick={onClose}
            className="px-8 py-3 border border-[var(--gold)] text-[var(--gold)] hover:bg-[var(--gold)] hover:text-black rounded-full text-sm uppercase tracking-wider transition-all duration-300"
          >
            Retour
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SuccessMessage;
