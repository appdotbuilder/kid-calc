import { useState, useEffect } from 'react';

interface CongratulationsMessageProps {
  show: boolean;
  operation: string;
}

const congratsMessages = [
  "🌟 Awesome job! 🌟",
  "🎉 You're a math star! 🎉", 
  "✨ Great calculation! ✨",
  "🏆 Math champion! 🏆",
  "🎯 Perfect! 🎯",
  "🚀 You're getting better! 🚀",
  "🌈 Fantastic work! 🌈",
  "⭐ Keep it up! ⭐",
  "🎊 Math wizard! 🎊",
  "💫 Brilliant! 💫"
];

export function CongratulationsMessage({ show, operation }: CongratulationsMessageProps) {
  const [message, setMessage] = useState<string>('');
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    if (show) {
      const randomMessage = congratsMessages[Math.floor(Math.random() * congratsMessages.length)];
      setMessage(randomMessage);
      setIsVisible(true);
      
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-2xl font-bold px-8 py-4 rounded-full shadow-2xl animate-bounce border-4 border-white">
        {message}
      </div>
    </div>
  );
}