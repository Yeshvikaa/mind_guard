import React, { useEffect, useState } from 'react';
import { api } from '../context/AuthContext';
import { 
  Gamepad2, Award, Trophy, Play, CheckCircle2, 
  RotateCcw, Sparkles, Brain, Timer
} from 'lucide-react';

interface LeaderboardEntry {
  _id: string;
  highestScore: number;
  gameName: string;
  timestamp: string;
  userDetails: {
    fullName: string;
    profilePhoto: string;
    department: string;
  };
}

export const Games: React.FC = () => {
  const [activeGame, setActiveGame] = useState<'memory' | 'tap' | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [scoresLoggedCount, setScoresLoggedCount] = useState(0);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // 1. Memory Match game states
  const emojis = ['🍀', '🦋', '🐳', '🌈', '🧘', '🍵', '🌸', '🕊️'];
  const [cards, setCards] = useState<Array<{ id: number; emoji: string; flipped: boolean; matched: boolean }>>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [memoryCompleted, setMemoryCompleted] = useState(false);

  // 2. Breathing Tap rhythm game states
  const [bubbleSize, setBubbleSize] = useState(1);
  const [tapScore, setTapScore] = useState(0);
  const [tapTimeLeft, setTapTimeLeft] = useState(0);
  const [tapActive, setTapActive] = useState(false);

  const fetchLeaderboard = async () => {
    try {
      const res = await api.get('/games/leaderboard');
      if (res.data.success) {
        setLeaderboard(res.data.leaderboard);
      }
    } catch (err) {
      console.warn('Leaderboard loading failed', err);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [scoresLoggedCount]);

  // Memory Match game loop initializer
  const initMemoryGame = () => {
    const deck = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        flipped: false,
        matched: false
      }));
    setCards(deck);
    setSelectedCards([]);
    setMoves(0);
    setMemoryCompleted(false);
  };

  const handleCardClick = (id: number) => {
    if (selectedCards.length === 2 || cards[id].flipped || cards[id].matched) return;

    // Flip card
    const newCards = [...cards];
    newCards[id].flipped = true;
    setCards(newCards);

    const newSelected = [...selectedCards, id];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      setMoves(prev => prev + 1);
      const [first, second] = newSelected;
      if (cards[first].emoji === cards[second].emoji) {
        // Matched!
        setTimeout(() => {
          const matchedCards = cards.map(c => 
            c.id === first || c.id === second ? { ...c, matched: true } : c
          );
          setCards(matchedCards);
          setSelectedCards([]);
          // Check win condition
          if (matchedCards.every(c => c.matched)) {
            handleGameWin('Memory Match', Math.max(10, 100 - moves));
            setMemoryCompleted(true);
          }
        }, 500);
      } else {
        // Mis-match, flip back
        setTimeout(() => {
          const resetCards = cards.map(c => 
            c.id === first || c.id === second ? { ...c, flipped: false } : c
          );
          setCards(resetCards);
          setSelectedCards([]);
        }, 1000);
      }
    }
  };

  // Breathing Tap game loop
  useEffect(() => {
    if (!tapActive) return;

    if (tapTimeLeft === 0) {
      setTapActive(false);
      handleGameWin('Breathing Tap', tapScore * 10);
      return;
    }

    // Shrink / expand bubble size cyclically
    const bubbleInterval = setInterval(() => {
      setBubbleSize(prev => (prev >= 1.5 ? 0.8 : prev + 0.15));
    }, 100);

    const timeInterval = setInterval(() => {
      setTapTimeLeft(prev => prev - 1);
    }, 1000);

    return () => {
      clearInterval(bubbleInterval);
      clearInterval(timeInterval);
    };
  }, [tapActive, tapTimeLeft, tapScore]);

  const startTapGame = () => {
    setTapScore(0);
    setTapTimeLeft(15);
    setTapActive(true);
    setBubbleSize(1);
  };

  const handleBubbleTap = () => {
    if (!tapActive) return;
    // Score based on alignment: user scores more if circle is closest to perfect expansion (1.5)
    const deviation = Math.abs(bubbleSize - 1.5);
    let points = 5;
    if (deviation < 0.2) points = 10;
    setTapScore(prev => prev + points);
    // Move size randomly
    setBubbleSize(0.8 + Math.random() * 0.4);
  };

  const handleGameWin = async (gameName: string, finalScore: number) => {
    try {
      const res = await api.post('/games', { gameName, score: finalScore });
      if (res.data.success) {
        setSuccessMsg(`Congratulations! Saved ${gameName} score of ${finalScore} to leaderboard.`);
        setScoresLoggedCount(prev => prev + 1);
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (err) {
      console.warn(err);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Wellness Mini Games</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Take cognitive offloading breaks. Play short wellness mini-games to claim high scores.</p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-2 max-w-3xl">
          <CheckCircle2 className="w-5 h-5 animate-pulse" />
          <span className="text-sm font-semibold">{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Game play arena */}
        <div className="lg:col-span-2 p-8 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl shadow-sm flex flex-col justify-center min-h-[450px]">
          {!activeGame ? (
            <div className="text-center space-y-6 max-w-md mx-auto">
              <div className="w-16 h-16 bg-brand-500/10 text-brand-500 rounded-full flex items-center justify-center mx-auto">
                <Gamepad2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-850 dark:text-white">Select a Wellness Mini Game</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Offload micro-tensions. Play Memory Match cards or rhythmic Breathing Tap. Win scores to populate the team ranking logs.
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setActiveGame('memory');
                    initMemoryGame();
                  }}
                  className="flex-1 py-3 px-4 bg-brand-500 text-white font-bold rounded-2xl text-xs hover:bg-brand-600 transition shadow"
                >
                  Memory Match
                </button>
                <button
                  onClick={() => {
                    setActiveGame('tap');
                    startTapGame();
                  }}
                  className="flex-1 py-3 px-4 bg-brand-500 text-white font-bold rounded-2xl text-xs hover:bg-brand-600 transition shadow"
                >
                  Breathing Tap
                </button>
              </div>
            </div>
          ) : activeGame === 'memory' ? (
            <div className="space-y-6 text-center">
              <div className="flex justify-between items-center max-w-sm mx-auto">
                <span className="text-sm font-bold text-slate-600 dark:text-slate-350">Moves: {moves}</span>
                <button 
                  onClick={initMemoryGame}
                  className="text-xs text-brand-500 hover:underline flex items-center gap-1 font-bold"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Restart Game
                </button>
              </div>

              {/* Grid cards */}
              <div className="grid grid-cols-4 gap-4 max-w-sm mx-auto">
                {cards.map(card => (
                  <button
                    key={card.id}
                    onClick={() => handleCardClick(card.id)}
                    className={`h-16 rounded-2xl text-2xl flex items-center justify-center transition-all duration-300 transform ${
                      card.flipped || card.matched
                        ? 'bg-brand-500 text-white scale-100 rotate-0'
                        : 'bg-slate-100 dark:bg-dark-800 text-transparent scale-95 hover:scale-100'
                    }`}
                  >
                    {(card.flipped || card.matched) ? card.emoji : '?'}
                  </button>
                ))}
              </div>

              {memoryCompleted && (
                <div className="text-center py-4 space-y-2">
                  <p className="text-emerald-500 font-bold text-sm">Victory! Game completed.</p>
                  <button 
                    onClick={() => setActiveGame(null)}
                    className="text-xs text-slate-400 hover:text-slate-600 underline font-bold"
                  >
                    Go Back to Selection
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6 text-center">
              <div className="flex justify-between items-center max-w-sm mx-auto">
                <span className="text-sm font-bold text-slate-600 dark:text-slate-350">Time Left: {tapTimeLeft}s</span>
                <span className="text-sm font-bold text-slate-600 dark:text-slate-350">Score: {tapScore}</span>
              </div>

              {/* Tapping Bubble Visual */}
              <div className="h-56 flex items-center justify-center">
                {tapActive ? (
                  <button
                    onClick={handleBubbleTap}
                    style={{ transform: `scale(${bubbleSize})` }}
                    className="w-24 h-24 rounded-full bg-brand-500 text-white font-bold flex items-center justify-center transition-transform duration-100 shadow-xl shadow-brand-500/20 active:bg-brand-600 hover:glow-blue focus:outline-none"
                  >
                    TAP ME!
                  </button>
                ) : (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-400">Rhythm tap concentration test.</p>
                    <button
                      onClick={startTapGame}
                      className="px-6 py-3 bg-brand-500 text-white rounded-2xl text-xs font-bold hover:bg-brand-600 transition"
                    >
                      Start Tap Challenge
                    </button>
                  </div>
                )}
              </div>

              {!tapActive && tapScore > 0 && (
                <div className="text-center space-y-2">
                  <p className="text-emerald-500 font-bold text-sm">Time's Up! Final Score: {tapScore * 10}</p>
                  <button 
                    onClick={() => setActiveGame(null)}
                    className="text-xs text-slate-400 hover:text-slate-600 underline font-bold"
                  >
                    Go Back to Selection
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Global / Team Leaderboard */}
        <div className="p-6 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-3xl shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" /> Wellness Leaderboard
            </h3>
            <p className="text-xs text-slate-400 mt-1">Top scores among company employees</p>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-80 pt-4">
            {leaderboard.length === 0 ? (
              <div className="text-center text-slate-400 text-xs py-10">Leaderboard is empty. Be the first to play!</div>
            ) : (
              leaderboard.map((item, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 dark:border-dark-850"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs ${
                      index === 0 ? 'bg-amber-100 text-amber-700' :
                      index === 1 ? 'bg-slate-200 text-slate-700' :
                      index === 2 ? 'bg-orange-100 text-orange-700' : 'text-slate-400'
                    }`}>
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-bold text-xs text-slate-850 dark:text-white">
                        {item.userDetails.fullName}
                      </p>
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider block">
                        {item.userDetails.department} • {item.gameName}
                      </span>
                    </div>
                  </div>
                  <span className="text-sm font-black text-brand-600 dark:text-brand-400">
                    {item.highestScore}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Games;
