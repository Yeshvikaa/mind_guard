import React, { useEffect, useRef, useState } from 'react';
import { api } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, Heart, SkipForward, SkipBack, 
  Volume2, Sparkles, Brain, Clock, ListMusic
} from 'lucide-react';

interface Track {
  id: string;
  title: string;
  category: string;
  url: string;
  duration: string;
  sec: number;
}

const tracks: Track[] = [
  { id: 't1', title: 'Ocean Waves Rest', category: 'Breathing', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', duration: '6:12', sec: 372 },
  { id: 't2', title: 'Rainforest Healing', category: 'Relaxation', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', duration: '7:05', sec: 425 },
  { id: 't3', title: 'Box Breathing Focus', category: 'Focus', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', duration: '5:44', sec: 344 },
  { id: 't4', title: 'Deep Sleep Ambient', category: 'Sleep', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', duration: '5:02', sec: 302 }
];

export const Meditation: React.FC = () => {
  const [currentTrack, setCurrentTrack] = useState<Track>(tracks[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  
  const [favorites, setFavorites] = useState<string[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  
  // Breathing animation states
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold (In)' | 'Exhale' | 'Hold (Out)'>('Inhale');
  const [breathSec, setBreathSec] = useState(4);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchMeditationData = async () => {
    try {
      const favsRes = await api.get('/meditation/favorites');
      if (favsRes.data.success) {
        setFavorites(favsRes.data.favorites.map((f: any) => f.trackId));
      }

      const histRes = await api.get('/meditation/history');
      if (histRes.data.success) {
        setHistory(histRes.data.history);
      }
    } catch (error) {
      console.warn('Failed to load meditation records', error);
    }
  };

  useEffect(() => {
    fetchMeditationData();
  }, []);

  // Audio Playback effect
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(currentTrack.url);
    audioRef.current = audio;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration || currentTrack.sec);
    const onEnded = () => {
      setIsPlaying(false);
      logSessionComplete();
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    if (isPlaying) {
      audio.play().catch(e => console.warn('Audio play aborted', e));
    }

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.pause();
    };
  }, [currentTrack]);

  // Handle Play/Pause toggle
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.warn(e));
    }
    setIsPlaying(!isPlaying);
  };

  // Log completed session to DB
  const logSessionComplete = async () => {
    try {
      await api.post('/meditation/history', {
        trackId: currentTrack.id,
        trackTitle: currentTrack.title,
        category: currentTrack.category,
        durationSeconds: Math.round(audioRef.current?.currentTime || currentTrack.sec)
      });
      fetchMeditationData();
    } catch (err) {
      console.warn(err);
    }
  };

  // Favoriting toggle
  const toggleFav = async (trackId: string) => {
    try {
      const res = await api.post('/meditation/favorite', { trackId });
      if (res.data.success) {
        if (res.data.favorited) {
          setFavorites(prev => [...prev, trackId]);
        } else {
          setFavorites(prev => prev.filter(id => id !== trackId));
        }
      }
    } catch (err) {
      console.warn(err);
    }
  };

  // Breathing Box timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setBreathSec(prev => {
        if (prev === 1) {
          // Switch phase
          setBreathPhase(current => {
            if (current === 'Inhale') return 'Hold (In)';
            if (current === 'Hold (In)') return 'Exhale';
            if (current === 'Exhale') return 'Hold (Out)';
            return 'Inhale';
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Meditation & Breathing</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Calm your amygdala with box breathing guides and ambient audio player loops.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Breathing Animation panel */}
        <div className="p-8 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl shadow-sm flex flex-col items-center justify-center space-y-8">
          <div className="text-center">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center justify-center gap-2">
              <Brain className="w-5 h-5 text-brand-500" /> Box Breathing Coach
            </h3>
            <p className="text-xs text-slate-400 mt-1">Standard 4-4-4-4 grounding cadence</p>
          </div>

          {/* Breathing Circle visualizer */}
          <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Pulsing ring */}
            <motion.div
              animate={{
                scale: 
                  breathPhase === 'Inhale' ? [1, 1.4] :
                  breathPhase === 'Hold (In)' ? 1.4 :
                  breathPhase === 'Exhale' ? [1.4, 1] : 1
              }}
              transition={{ duration: 4, ease: 'easeInOut' }}
              className={`absolute inset-0 rounded-full blur-xl opacity-20 ${
                breathPhase.startsWith('Hold') ? 'bg-amber-500' : 'bg-brand-500'
              }`}
            />

            {/* Core Circle */}
            <motion.div
              animate={{
                scale: 
                  breathPhase === 'Inhale' ? 1.4 :
                  breathPhase === 'Hold (In)' ? 1.4 :
                  breathPhase === 'Exhale' ? 1 : 1
              }}
              transition={{ duration: 4, ease: 'easeInOut' }}
              className={`w-40 h-40 rounded-full flex flex-col items-center justify-center border-4 border-white dark:border-dark-800 shadow-xl transition-colors duration-500 ${
                breathPhase.startsWith('Hold') 
                  ? 'bg-amber-500 text-white' 
                  : 'bg-brand-500 text-white shadow-brand-500/20'
              }`}
            >
              <span className="text-lg font-black tracking-wide">{breathPhase}</span>
              <span className="text-3xl font-black mt-1">{breathSec}s</span>
            </motion.div>
          </div>

          <p className="text-xs text-slate-400 max-w-sm text-center leading-relaxed">
            {breathPhase === 'Inhale' && 'Slowly fill your lungs with fresh clean air.'}
            {breathPhase === 'Hold (In)' && 'Retain the air in your chest, centering your thoughts.'}
            {breathPhase === 'Exhale' && 'Sigh out completely, letting go of muscle tension.'}
            {breathPhase === 'Hold (Out)' && 'Rest empty-lunged, awaiting the next cycle.'}
          </p>
        </div>

        {/* Audio Player panel */}
        <div className="p-8 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl shadow-sm flex flex-col justify-between space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-indigo-500" /> Ambient Player
            </h3>
            <button 
              onClick={() => toggleFav(currentTrack.id)}
              className={`p-2.5 rounded-xl border border-slate-200 dark:border-dark-850 hover:bg-slate-50 dark:hover:bg-dark-800 transition ${
                favorites.includes(currentTrack.id) ? 'text-red-500 bg-red-50 dark:bg-red-950/20' : 'text-slate-400'
              }`}
            >
              <Heart className={`w-5 h-5 ${favorites.includes(currentTrack.id) ? 'fill-red-500' : ''}`} />
            </button>
          </div>

          {/* Active track cover */}
          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-dark-950/50 border border-slate-100 dark:border-dark-850 flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-500 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-brand-500/20 flex-shrink-0">
              {currentTrack.title.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-extrabold text-brand-600 dark:text-brand-400 uppercase tracking-widest block">
                {currentTrack.category}
              </span>
              <h4 className="text-base font-bold text-slate-800 dark:text-white truncate mt-1">
                {currentTrack.title}
              </h4>
            </div>
          </div>

          {/* Progress Slider */}
          <div className="space-y-2">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={e => {
                if (audioRef.current) {
                  audioRef.current.currentTime = Number(e.target.value);
                }
              }}
              className="w-full accent-brand-500 h-1.5 bg-slate-100 dark:bg-dark-800 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs font-semibold text-slate-400">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center items-center gap-6">
            <button className="text-slate-400 hover:text-slate-600">
              <SkipBack className="w-5 h-5" />
            </button>
            <button 
              onClick={togglePlay}
              className="w-16 h-16 rounded-full bg-brand-500 hover:bg-brand-600 text-white flex items-center justify-center shadow-xl shadow-brand-500/25 transition-all hover:scale-105"
            >
              {isPlaying ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white ml-1" />}
            </button>
            <button className="text-slate-400 hover:text-slate-600">
              <SkipForward className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Playlist selections & Recent History */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Track selections */}
        <div className="p-6 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <ListMusic className="w-5 h-5 text-indigo-500" /> Meditation Playlists
          </h3>

          <div className="space-y-3">
            {tracks.map(track => {
              const isSelected = currentTrack.id === track.id;
              return (
                <div
                  key={track.id}
                  onClick={() => setCurrentTrack(track)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    isSelected 
                      ? 'bg-brand-50/30 dark:bg-brand-950/15 border-brand-500/30' 
                      : 'border-slate-100 dark:border-dark-850 hover:bg-slate-50 dark:hover:bg-dark-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold px-2 py-1 rounded-lg bg-slate-100 dark:bg-dark-800 text-slate-500 dark:text-slate-400">
                      {track.category}
                    </span>
                    <p className="font-bold text-sm text-slate-800 dark:text-white">
                      {track.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 font-semibold">{track.duration}</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFav(track.id);
                      }}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <Heart className={`w-4 h-4 ${favorites.includes(track.id) ? 'fill-red-500 text-red-500' : ''}`} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent plays history */}
        <div className="p-6 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-500" /> Recently Played History
          </h3>

          {history.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-sm">
              Your listening history is empty. Play some tracks above!
            </div>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {history.map(item => (
                <div 
                  key={item._id} 
                  className="p-3.5 rounded-2xl border border-slate-100 dark:border-dark-850 flex justify-between items-center"
                >
                  <div>
                    <h4 className="font-bold text-sm text-slate-850 dark:text-white">{item.trackTitle}</h4>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">{item.category}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-500 block">
                      {Math.round(item.durationSeconds / 60)} mins
                    </span>
                    <span className="text-[9px] text-slate-400">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default Meditation;
