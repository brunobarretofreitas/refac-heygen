"use client";

import { Button } from "antd";
import { motion } from "framer-motion";

import { useAvatar } from "@/providers/AvatarProvider";

const Header = () => (
  <motion.h1
    initial={{ opacity: 0, y: -30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7, ease: "easeOut" }}
    className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg text-center"
  >
    Bem-vindo ao nosso <span className="text-blue-400">Assistente Virtual</span>
    !
  </motion.h1>
);

const WelcomeText = () => (
  <motion.p
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3, duration: 0.7, ease: "easeOut" }}
    className="text-lg md:text-xl text-gray-200 text-center max-w-2xl mx-auto mt-4"
  >
    Tire suas dúvidas com nosso assistente inteligente e interativo.
    <br />
    <span className="block mt-2 text-blue-300 font-medium">
      Você pode se comunicar com o assistente via texto ou voz.
    </span>
  </motion.p>
);

const StartButton = ({ onClick }: { onClick: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.8, duration: 0.5 }}
    className="mt-6"
  >
    <Button
      type="primary"
      size="large"
      className="bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold px-8 py-3 rounded-full shadow-lg hover:scale-105 hover:from-blue-400 hover:to-blue-600 transition-all duration-300"
      onClick={onClick}
    >
      Falar com o Assistente
    </Button>
  </motion.div>
);

const Welcome = () => {
  const {
    actions: { initializeAvatar },
  } = useAvatar();
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-950 to-blue-950 px-4 py-8 animate-fade-in">
      <Header />
      <WelcomeText />
      <StartButton onClick={initializeAvatar} />
    </div>
  );
};

export default Welcome;
