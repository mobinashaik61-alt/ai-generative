import React from 'react';
import SnakeGame from './components/SnakeGame';
import MusicPlayer from './components/MusicPlayer';

export default function App() {
  return (
    <div className="min-h-screen bg-black text-[#00ffff] flex flex-col font-mono selection:bg-[#ff00ff] selection:text-black crt">
      
      <header className="w-full p-6 border-b-2 border-[#00ffff] flex flex-col items-center justify-center relative z-10 bg-black">
        <h1 className="text-4xl md:text-6xl font-black tracking-widest uppercase glitch-text">
          SNAKE_FRIEND.EXE
        </h1>
        <p className="text-[#ff00ff] mt-2 text-sm tracking-widest">v2.0.4 // NEURAL LINK ESTABLISHED</p>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center p-6 relative z-10 gap-8 w-full max-w-6xl mx-auto">
        
        <div className="w-full lg:w-2/3 flex justify-center">
          <SnakeGame />
        </div>

        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          <div className="border border-[#00ffff] p-4 text-sm text-[#00ffff]/70 uppercase">
            <p>&gt; WARNING: ANOMALY DETECTED</p>
            <p>&gt; INITIATING PROTOCOL 7...</p>
            <p>&gt; AWAITING USER OVERRIDE</p>
          </div>
          <MusicPlayer />
        </div>

      </main>

      <footer className="w-full p-4 border-t-2 border-[#ff00ff] text-center text-[#ff00ff] font-mono text-xs relative z-10 bg-black">
        <p>END OF LINE.</p>
      </footer>
    </div>
  );
}
