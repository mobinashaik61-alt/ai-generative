import React, { useState, useRef, useEffect } from 'react';

const TRACKS = [
  { id: 1, title: "SYS.AUDIO.01", artist: "UNKNOWN_ENTITY", url: "https://actions.google.com/sounds/v1/music/ambient_music.ogg" },
  { id: 2, title: "DATA_STREAM_BETA", artist: "NEURAL_NET", url: "https://actions.google.com/sounds/v1/music/driving_in_the_city.ogg" },
  { id: 3, title: "QUANTUM_NOISE", artist: "ALGORITHM_X", url: "https://actions.google.com/sounds/v1/music/club_music.ogg" }
];

export default function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    } else if (!isPlaying && audioRef.current) {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrackIndex]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const nextTrack = () => { setCurrentTrackIndex((p) => (p + 1) % TRACKS.length); setIsPlaying(true); };
  const prevTrack = () => { setCurrentTrackIndex((p) => (p - 1 + TRACKS.length) % TRACKS.length); setIsPlaying(true); };

  const handleTimeUpdate = () => {
    if (audioRef.current && audioRef.current.duration) {
      setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
    }
  };

  return (
    <div className="w-full max-w-md border-2 border-[#ff00ff] bg-black p-4 font-mono relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-[#00ffff] opacity-50 animate-pulse" />
      
      <audio ref={audioRef} src={currentTrack.url} onTimeUpdate={handleTimeUpdate} onEnded={nextTrack} />

      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-end border-b border-[#00ffff]/30 pb-2">
          <div>
            <h3 className="text-[#00ffff] text-2xl uppercase glitch-text">{currentTrack.title}</h3>
            <p className="text-[#ff00ff] text-sm">AUTHOR: {currentTrack.artist}</p>
          </div>
          <div className="text-[#00ffff] text-xs">
            [{isPlaying ? 'ACTIVE' : 'IDLE'}]
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button onClick={prevTrack} className="px-3 py-1 border border-[#00ffff] text-[#00ffff] hover:bg-[#00ffff] hover:text-black cursor-pointer">
              &lt;&lt;
            </button>
            <button onClick={togglePlay} className="px-4 py-1 border border-[#ff00ff] text-[#ff00ff] hover:bg-[#ff00ff] hover:text-black cursor-pointer">
              {isPlaying ? 'HALT' : 'EXEC'}
            </button>
            <button onClick={nextTrack} className="px-3 py-1 border border-[#00ffff] text-[#00ffff] hover:bg-[#00ffff] hover:text-black cursor-pointer">
              &gt;&gt;
            </button>
          </div>

          {/* Visualizer mock */}
          <div className="flex items-end gap-1 h-8">
            {[...Array(8)].map((_, i) => (
              <div 
                key={i} 
                className="w-2 bg-[#00ffff]" 
                style={{ 
                  height: '10%',
                  animation: isPlaying ? `eq ${0.3 + Math.random() * 0.5}s infinite alternate ${Math.random()}s` : 'none'
                }} 
              />
            ))}
          </div>
        </div>

        <div className="h-2 border border-[#ff00ff] relative">
          <div className="absolute top-0 left-0 h-full bg-[#ff00ff]" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}
