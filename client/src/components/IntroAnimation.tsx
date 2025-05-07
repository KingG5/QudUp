import { motion } from "framer-motion";

const IntroAnimation = () => {
  return (
    <motion.div
      className="fixed inset-0 bg-[var(--black)] z-[9997] flex justify-center items-center"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0, pointerEvents: "none" }}
      transition={{ delay: 2, duration: 1 }}
    >
      <motion.div
        className="text-3xl md:text-5xl font-bold tracking-tighter text-[var(--white)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        QudUP
      </motion.div>
    </motion.div>
  );
};

export default IntroAnimation;
