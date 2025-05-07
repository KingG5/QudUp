import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import CustomCursor from "@/components/CustomCursor";
import IntroAnimation from "@/components/IntroAnimation";
import WaitlistForm from "@/components/WaitlistForm";
import SuccessMessage from "@/components/SuccessMessage";

const navItems = [
  { label: "À propos", href: "#" },
  { label: "Fonctionnalités", href: "#" },
  { label: "Contact", href: "#" },
];

const Home = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const handleFormSuccess = () => {
    setShowSuccess(true);
  };

  const closeSuccessMessage = () => {
    setShowSuccess(false);
  };

  return (
    <>
      <CustomCursor />
      <IntroAnimation />
      <div className="container relative h-screen w-full overflow-hidden">
        <div className="grain-overlay" />

        <motion.div
          className="absolute inset-0 bg-cover bg-center z-10"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1511881830150-850572962174?ixlib=rb-4.0.3&auto=format&fit=crop&w=2338&q=80')"
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1.2 }}
          whileHover={{ scale: 1.05 }}
          style={{
            transform: `scale(1.05) translate(${
              (mousePosition.x / window.innerWidth - 0.5) * -20
            }px, ${(mousePosition.y / window.innerHeight - 0.5) * -20}px)`,
          }}
        />

        <div className="overlay absolute inset-0 bg-gradient-to-b from-black/20 to-black/70 z-20"></div>

        <div className="content relative z-30 h-full w-full grid grid-cols-1 md:grid-cols-2 grid-rows-[auto_1fr_auto] p-6 md:p-10">
          <motion.header
            className="col-span-1 md:col-span-2 flex justify-between items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 0.8 }}
          >
            <div className="logo text-2xl font-bold tracking-tight">
              QudUP
            </div>
            <nav className="hidden md:block">
              <ul className="flex">
                {navItems.map((item, index) => (
                  <li
                    key={index}
                    className="ml-8 text-xs tracking-wider uppercase opacity-70 transition-all duration-500 hover:opacity-100 hover:text-[var(--gold)] cursor-pointer"
                  >
                    {item.label}
                  </li>
                ))}
              </ul>
            </nav>
          </motion.header>

          <main className="md:pr-10 flex flex-col justify-center col-span-1">
            <motion.h1
              className="headline text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-none tracking-tight mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.2, duration: 0.8 }}
            >
              <span>Garde une</span><br />
              <span className="text-[var(--gold)]">longueur d'avance.</span>
            </motion.h1>
            
            <motion.p
              className="tagline text-base font-light tracking-wide max-w-md mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.4, duration: 0.8 }}
            >
              L'application exclusive qui va tout changer. Soyez parmi les premiers à découvrir QudUP.
            </motion.p>
            
            <motion.div
              className="social-icons md:hidden flex space-x-6 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.6, duration: 0.8 }}
            >
              <a href="#" className="text-white hover:text-[var(--gold)] transition-colors duration-300">
                <i className="fab fa-instagram text-xl"></i>
              </a>
              <a href="#" className="text-white hover:text-[var(--gold)] transition-colors duration-300">
                <i className="fab fa-twitter text-xl"></i>
              </a>
              <a href="#" className="text-white hover:text-[var(--gold)] transition-colors duration-300">
                <i className="fab fa-linkedin-in text-xl"></i>
              </a>
            </motion.div>
          </main>

          <WaitlistForm onSuccess={handleFormSuccess} />

          <motion.footer
            className="col-span-1 md:col-span-2 flex justify-between items-center mt-auto py-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.8, duration: 0.8 }}
          >
            <div className="copyright text-xs opacity-50">
              &copy; {new Date().getFullYear()} QudUP. Tous droits réservés.
            </div>
            
            <div className="social-icons hidden md:flex space-x-6">
              <a href="#" className="text-white hover:text-[var(--gold)] transition-colors duration-300">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-white hover:text-[var(--gold)] transition-colors duration-300">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-white hover:text-[var(--gold)] transition-colors duration-300">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
          </motion.footer>
        </div>

        <SuccessMessage isVisible={showSuccess} onClose={closeSuccessMessage} />
      </div>
    </>
  );
};

export default Home;
