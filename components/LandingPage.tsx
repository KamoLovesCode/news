import React from 'react';

interface LandingPageProps {
  onEnter: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  return (
    <div className="h-screen w-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Background Gradient Animation */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900 via-black to-gray-900 animate-gradient-xy"></div>
        <style>{`
          @keyframes gradient-xy {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          .animate-gradient-xy {
            background-size: 200% 200%;
            animation: gradient-xy 15s ease infinite;
          }
        `}</style>

        <div className="relative z-10 text-center flex flex-col items-center">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4">
                kamoc <span className="text-gray-400">des news</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mb-8">
                Your daily source for the latest headlines, breaking stories, and in-depth analysis from South Africa and around the world.
            </p>
            <button
                onClick={onEnter}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-3 px-8 rounded-full transition-transform transform hover:scale-105 duration-300 ease-in-out shadow-lg"
            >
                Read Latest News
            </button>
        </div>
    </div>
  );
};

export default LandingPage;
