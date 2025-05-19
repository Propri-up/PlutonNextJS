"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Composant amélioré avec une meilleure compatibilité entre navigateurs
const AnimatedPropertyType: React.FC<{ word: string }> = ({ word }) => {
  // Create variants for the container and the characters
  const container = {
    hidden: {},
    visible: (i = 1) => ({
      transition: {
        staggerChildren: 0.03,
        delayChildren: 0.04 * i
      }
    }),
    exit: {
      transition: {
        staggerChildren: 0.02,
        staggerDirection: -1
      }
    }
  };
  
  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200
      }
    },
    hidden: {
      opacity: 0,
      y: 20,
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <motion.span
      className="bg-gradient-to-r from-[#3461FF] to-[#8454EB] text-transparent bg-clip-text inline-block"
      variants={container}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{
        display: "inline-block",
        color: '#8454EB', // fallback for browsers without bg-clip:text, matches purple
        textShadow: '0 2px 8px #222a',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
      }}
    >
        {Array.from(word).map((letter, index) => (
          <motion.span
            key={index}
            variants={child}
            style={{
              display: letter === " " ? "inline" : "inline-block",
              willChange: "transform, opacity",
            }}
          >
            {letter}
          </motion.span>
        ))}
      </motion.span>
  );
};

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [propertyTypeIndex, setPropertyTypeIndex] = useState(0);
  const propertyTypes = ["appartements", "maisons", "locaux", "terrains", "immeubles"];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPropertyTypeIndex((prevIndex) => (prevIndex + 1) % propertyTypes.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A22] text-white overflow-hidden">
      {/* En-tête avec effet de transparence au défilement */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#0A0A22]/90 backdrop-blur-md py-3" : "bg-transparent py-5"}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6">
          <div className="flex items-center space-x-3">
            <Image src="/logo.png" alt="Logo" width={40} height={40} priority className="rounded-xl" />
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-2xl font-bold tracking-tight"
            >
              Pluton
            </motion.h1>
          </div>

          {/* Menu mobile */}
          <button
            className="md:hidden p-2 rounded-full bg-white/10 hover:bg-white/20"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {menuOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M4 8h16M4 16h16" />
              )}
            </svg>
          </button>

          {/* Navigation desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            {["Fonctionnalités", "Télécharger"].map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * i }}
              >
                <Link href={item === "Fonctionnalités" ? "#features" : item === "Télécharger" ? "#download" : "/login"} className="text-gray-300 hover:text-white transition-colors">
                  {item}
                </Link>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/login" className="bg-gradient-to-r from-[#3461FF] to-[#8454EB] hover:opacity-90 text-white font-medium py-2 px-6 rounded-full shadow-lg transition-all duration-300">
                Connexion
              </Link>
            </motion.div>
          </nav>
        </div>

        {/* Menu mobile */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden px-6 overflow-hidden"
            >
              <div className="flex flex-col space-y-4 bg-[#171733]/80 backdrop-blur-md rounded-2xl p-4 mt-2">
                <Link href="#download" className="text-gray-300 hover:text-white transition-colors px-4 py-2">
                  Télécharger
                </Link>
                <Link href="/login" className="bg-gradient-to-r from-[#3461FF] to-[#8454EB] hover:opacity-90 text-white font-medium py-2 px-4 rounded-full shadow-lg">
                  Inscription
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-grow flex flex-col pt-32 px-6">
        {/* Section héro avec design moderne */}
        <section className="max-w-7xl mx-auto w-full py-16 md:py-24 justify-center text-center">
          <div className="flex flex-col items-center">
            <div className="space-y-6 max-w-3xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="inline-block bg-white/10 backdrop-blur-md rounded-full px-4 py-2 text-sm"
              >
                ✨ Simplifiez la gestion immobilière
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-5xl md:text-6xl font-bold tracking-tight leading-tight"
              >
                Gérez vos{" "}
                <AnimatePresence mode="wait">
                  <motion.span
                    key={propertyTypeIndex}
                    style={{ 
                      display: "inline-block",
                      willChange: "transform"
                    }}
                  >
                    <AnimatedPropertyType word={propertyTypes[propertyTypeIndex]} />
                  </motion.span>
                </AnimatePresence>{" "}
                simplement.
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-xl md:text-2xl text-gray-300 leading-relaxed"
              >
                Optimisez la gestion de vos biens immobiliers avec Pluton. Suivi des locations, automatisation, et bien plus en un seul endroit.
              </motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 mt-8"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/register" className="bg-gradient-to-r from-[#3461FF] to-[#8454EB] hover:opacity-90 text-white font-medium py-3 px-8 rounded-full shadow-lg flex items-center justify-center group transition-all duration-300">
                  Commencer maintenant
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                </Link>
              </motion.div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 100,
                damping: 15,
                delay: 0.8 
              }}
              className="mt-20 w-full relative"
            >
              <div className="absolute -inset-10 bg-gradient-to-r from-[#3461FF]/20 to-[#8454EB]/20 rounded-full blur-3xl"></div>
            </motion.div>
          </div>
        </section>

        {/* Section fonctionnalités avec design moderne */}
        <section id="features" className="max-w-7xl mx-auto w-full py-16 md:py-32">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <div className="inline-block bg-white/10 backdrop-blur-md rounded-full px-4 py-2 text-sm mb-4">
              💎 Fonctionnalités
            </div>
            <h2 className="text-4xl font-bold mb-6">Tout ce dont vous avez besoin</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Des outils puissants pour une gestion immobilière sans effort
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Suivi des Locations",
                description: "Gérez vos contrats de location, suivez les paiements et communiquez avec vos locataires facilement.",
                icon: "📊"
              },
              {
                title: "Automatisation",
                description: "Automatisez les tâches répétitives et gagnez du temps pour vous concentrer sur ce qui compte vraiment.",
                icon: "⚙️"
              },
              {
                title: "Rapports Détaillés",
                description: "Générez des rapports détaillés sur vos performances immobilières pour une meilleure prise de décision.",
                icon: "📈"
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: idx * 0.2 }}
                whileHover={{ 
                  y: -10,
                  boxShadow: "0 20px 25px -5px rgba(52, 97, 255, 0.1), 0 10px 10px -5px rgba(52, 97, 255, 0.04)" 
                }}
                className="bg-[#171733] border border-white/10 rounded-3xl p-8 hover:border-[#3461FF]/50 transition-all duration-300 text-center"
              >
                <motion.div 
                  className="text-3xl mb-6 flex justify-center"
                  animate={{ rotate: [0, 10, 0, -10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: idx * 0.7 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-300 mb-6">{feature.description}</p>
                <div className="flex justify-center">
                  <motion.div whileHover={{ x: 5 }} className="group">
                    <Link href="#" className="flex items-center text-[#3461FF] font-medium">
                      En savoir plus <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Section téléchargement avec design moderne */}
        <section id="download" className="max-w-7xl mx-auto w-full py-16 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-br from-[#171733] to-[#1D1D42] rounded-3xl p-10 md:p-16 border border-white/10 shadow-xl text-center md:text-left relative overflow-hidden"
          >
            {/* Éléments décoratifs d'arrière-plan */}
            <motion.div
              animate={{ 
                rotate: [0, 360], 
                opacity: [0.1, 0.2, 0.1] 
              }}
              transition={{ 
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute -top-40 -right-40 w-96 h-96 bg-[#3461FF]/10 rounded-full blur-3xl"
            />
            
            <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="inline-block bg-white/10 backdrop-blur-md rounded-full px-4 py-2 text-sm mb-6"
                >
                  📱 Mobile App
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-4xl font-bold mb-6"
                >
                  Téléchargez l'application
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="text-xl text-gray-300 mb-8"
                >
                  Accédez à Pluton où que vous soyez, sur tous vos appareils. Gérez vos biens immobiliers en déplacement.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center md:justify-start"
                >
                  <motion.a 
                    href="#" 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }}
                    className="transition-transform duration-300"
                  >
                    <Image src="/google-play-badge.png" alt="Télécharger pour Android" width={180} height={45} />
                  </motion.a>
                  <motion.a 
                    href="#" 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="transition-transform duration-300"
                  >
                    <Image src="/app-store-badge.svg" alt="Télécharger pour iOS" width={180} height={45} />
                  </motion.a>
                </motion.div>
              </div>
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  type: "spring", 
                  stiffness: 100,
                  damping: 15,
                  delay: 0.3 
                }}
                className="flex justify-center"
              >
                <div className="relative">
                  <motion.div
                    animate={{
                      y: [0, -10, 0],
                      rotate: [0, 2, 0, -2, 0]
                    }}
                    transition={{
                      duration: 6,
                      ease: "easeInOut",
                      repeat: Infinity
                    }}
                  >
                    <Image 
                      src="/logo.png" 
                      alt="Pluton App Mobile" 
                      width={250} 
                      height={500}
                      className="rounded-3xl shadow-2xl border border-white/20" 
                    />
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="bg-[#0D0D28] border-t border-white/10 py-16 px-6 mt-12 text-center md:text-left">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="flex items-center space-x-3 justify-center md:justify-start">
                <Image src="/logo.png" alt="Logo" width={40} height={40} className="rounded-xl" />
                <span className="text-xl font-bold">Pluton</span>
              </div>
              <p className="text-gray-400">
                La solution moderne pour la gestion immobilière.
              </p>
            </motion.div>

            {[
              {
                title: "Produit",
                links: [
                  { name: "Fonctionnalités", href: "#" },
                  { name: "Tarifs", href: "#" },
                  { name: "Téléchargement", href: "#" },
                ]
              },
              {
                title: "Entreprise",
                links: [
                  { name: "À propos", href: "#" },
                  { name: "Nous contacter", href: "#" },
                  { name: "Blog", href: "#" },
                ]
              },
              {
                title: "Légal",
                links: [
                  { name: "Mentions légales", href: "#" },
                  { name: "Confidentialité", href: "#" },
                  { name: "CGU", href: "#" },
                ]
              }
            ].map((column, idx) => (
              <motion.div
                key={column.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 * (idx + 1) }}
              >
                <h3 className="text-lg font-semibold mb-4">{column.title}</h3>
                <ul className="space-y-3">
                  {column.links.map((link) => (
                    <motion.li key={link.name} whileHover={{ x: 3 }}>
                      <Link href={link.href} className="text-gray-400 hover:text-white transition-colors">
                        {link.name}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.5 }}
            className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center"
          >
            <p className="text-gray-400">© 2025 Pluton. Tous droits réservés.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              {[
                {
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16 8C17.5913 8 19.1174 8.63214 20.2426 9.75736C21.3679 10.8826 22 12.4087 22 14V21H18V14C18 13.4696 17.7893 12.9609 17.4142 12.5858C17.0391 12.2107 16.5304 12 16 12C15.4696 12 14.9609 12.2107 14.5858 12.5858C14.2107 12.9609 14 13.4696 14 14V21H10V14C10 12.4087 10.6321 10.8826 11.7574 9.75736C12.8826 8.63214 14.4087 8 16 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M6 9H2V21H6V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M4 6C5.10457 6 6 5.10457 6 4C6 2.89543 5.10457 2 4 2C2.89543 2 2 2.89543 2 4C2 5.10457 2.89543 6 4 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )
                },
                {
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M23 3.01006C22.0424 3.68553 20.9821 4.20217 19.86 4.54006C19.2577 3.84757 18.4573 3.35675 17.567 3.13398C16.6767 2.91122 15.7395 2.96725 14.8821 3.29451C14.0247 3.62177 13.2884 4.20446 12.773 4.96377C12.2575 5.72309 11.9877 6.62239 12 7.54006V8.54006C10.2426 8.58562 8.50127 8.19587 6.93101 7.4055C5.36074 6.61513 4.01032 5.44869 3 4.01006C3 4.01006 -1 13.0101 8 17.0101C5.94053 18.408 3.48716 19.109 1 19.0101C10 24.0101 21 19.0101 21 7.51006C20.9991 7.23151 20.9723 6.95365 20.92 6.68006C21.9406 5.67355 22.6608 4.40277 23 3.01006Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )
                },
                {
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17 2H7C4.23858 2 2 4.23858 2 7V17C2 19.7614 4.23858 22 7 22H17C19.7614 22 22 19.7614 22 17V7C22 4.23858 19.7614 2 17 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M16 11.37C16.1234 12.2022 15.9813 13.0522 15.5938 13.799C15.2063 14.5458 14.5932 15.1514 13.8416 15.5297C13.0901 15.9079 12.2385 16.0396 11.4078 15.9059C10.5771 15.7723 9.80977 15.3801 9.21485 14.7852C8.61993 14.1902 8.22774 13.4229 8.09408 12.5922C7.96042 11.7615 8.09208 10.9099 8.47034 10.1584C8.8486 9.40685 9.45419 8.79374 10.201 8.40624C10.9478 8.01874 11.7978 7.87658 12.63 8C13.4789 8.12588 14.2649 8.52146 14.8717 9.12831C15.4785 9.73515 15.8741 10.5211 16 11.37Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M17.5 6.5H17.51" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )
                }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                    {item.icon}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}