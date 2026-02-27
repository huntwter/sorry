import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CanvasTree from './CanvasTree';

const JOKES = [
    "Why did the invisible man turn down the job offer? He couldn't see himself doing it! 👻",
    "I'm reading a book on anti-gravity. I just can't put it down! 📚",
    "Did you hear about the mathematician who's afraid of negative numbers? He'll stop at nothing to avoid them! 🔢",
    "Why don't skeletons fight each other? They don't have the guts. 💀",
    "What do you call a fake noodle? An impasta! 🍝",
    "Why did the scarecrow win an award? Because he was outstanding in his field! 🌾",
    "I would tell you a joke about pizza, but it's a little cheesy. 🍕"
];

export default function StageAngerMeter({ onNext }: { onNext: () => void }) {
    const [angerLevel, setAngerLevel] = useState(100);
    const [activeAction, setActiveAction] = useState<'none' | 'chocolate' | 'sorry' | 'joke'>('none');
    const [currentJoke, setCurrentJoke] = useState("");

    // Compute derived state for color and emoji
    const getColor = (level: number) => {
        if (level >= 70) return 'from-red-500 to-rose-600';
        if (level >= 40) return 'from-orange-400 to-orange-500';
        if (level >= 10) return 'from-yellow-300 to-yellow-400';
        return 'from-green-400 to-emerald-500';
    };

    const getEmoji = (level: number) => {
        if (level >= 70) return '😠';
        if (level >= 40) return '😒';
        if (level >= 10) return '😐';
        if (level > 0) return '🙂';
        return '🥰';
    };

    const handleActionClick = (action: 'chocolate' | 'sorry' | 'joke') => {
        if (action === 'joke') {
            setCurrentJoke(JOKES[Math.floor(Math.random() * JOKES.length)]);
        }
        setActiveAction(action);
    };

    const closeAction = (decreaseAmount: number) => {
        setActiveAction('none');
        setAngerLevel((prev) => Math.max(0, prev - decreaseAmount));
    };

    useEffect(() => {
        if (angerLevel === 0 && activeAction === 'none') {
            const timer = setTimeout(() => {
                onNext();
            }, 1500); // give it a moment of green/happy before transition
            return () => clearTimeout(timer);
        }
    }, [angerLevel, activeAction, onNext]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1 } }}
            className="w-full h-[100dvh] flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#fdfaf6] to-[#f4ebe1] select-none overflow-hidden relative"
        >
            <div className={`max-w-md w-full flex flex-col items-center gap-8 z-10 transition-all duration-500 ${activeAction !== 'none' ? 'blur-md opacity-40 scale-95' : ''}`}>
                {/* Big Emoji */}
                <motion.div
                    key={getEmoji(angerLevel)}
                    initial={{ scale: 0.5, opacity: 0, rotate: -15 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    transition={{ type: 'spring', bounce: 0.5 }}
                    className="text-[120px] md:text-[150px] drop-shadow-2xl"
                >
                    {getEmoji(angerLevel)}
                </motion.div>

                {/* Typography */}
                <h2 className="text-2xl md:text-3xl font-bold text-gray-700 text-center tracking-tight" style={{ fontFamily: "'Nunito', 'Quicksand', sans-serif" }}>
                    {angerLevel > 0 ? (
                        <>Oh no! Anger Level: <span className="text-rose-500">{angerLevel}%</span> 🥺</>
                    ) : (
                        <span className="text-emerald-500">Yay! Anger is 0%! 🥰</span>
                    )}
                </h2>

                {/* Thermometer / Progress Bar */}
                <div className="w-full bg-white/60 backdrop-blur-md rounded-full h-8 overflow-hidden shadow-[inset_0_2px_10px_rgba(0,0,0,0.1)] border border-white/80 relative">
                    <motion.div
                        className={`h-full rounded-full bg-gradient-to-r ${getColor(Math.max(1, angerLevel))}`}
                        initial={{ width: '100%' }}
                        animate={{
                            width: `${angerLevel}%`,
                            backgroundColor: angerLevel === 0 ? '#10b981' : undefined,
                            boxShadow: angerLevel > 0 ? `0 0 15px rgba(${angerLevel > 40 ? '244,63,94' : '234,179,8'},0.5)` : '0 0 15px rgba(16,185,129,0.5)'
                        }}
                        transition={{ type: 'spring', bounce: 0.3, duration: 0.8 }}
                    />
                </div>

                {/* Actions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4 w-full mt-4">
                    <AnimatePresence>
                        {angerLevel > 0 && (
                            <motion.div
                                initial={{ opacity: 1 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="flex flex-col gap-4 w-full"
                            >
                                <button
                                    onClick={() => handleActionClick('chocolate')}
                                    className="w-full py-4 bg-white/90 backdrop-blur-sm rounded-2xl shadow-[0_8px_16px_rgba(0,0,0,0.06)] border border-pink-100 hover:border-pink-300 hover:shadow-[0_12px_24px_rgba(236,72,153,0.2)] hover:-translate-y-1 active:scale-95 transition-all text-xl font-bold text-gray-700 flex items-center justify-center gap-3"
                                >
                                    Give Chocolates 🍫
                                </button>
                                <button
                                    onClick={() => handleActionClick('sorry')}
                                    className="w-full py-4 bg-white/90 backdrop-blur-sm rounded-2xl shadow-[0_8px_16px_rgba(0,0,0,0.06)] border border-blue-100 hover:border-blue-300 hover:shadow-[0_12px_24px_rgba(59,130,246,0.2)] hover:-translate-y-1 active:scale-95 transition-all text-xl font-bold text-gray-700 flex items-center justify-center gap-3"
                                >
                                    Say Sorry 1000x 🙇‍♂️
                                </button>
                                <button
                                    onClick={() => handleActionClick('joke')}
                                    className="w-full py-4 bg-white/90 backdrop-blur-sm rounded-2xl shadow-[0_8px_16px_rgba(0,0,0,0.06)] border border-yellow-100 hover:border-yellow-300 hover:shadow-[0_12px_24px_rgba(234,179,8,0.2)] hover:-translate-y-1 active:scale-95 transition-all text-xl font-bold text-gray-700 flex items-center justify-center gap-3"
                                >
                                    Crack a lame joke 🤡
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Overlays */}
            <AnimatePresence>
                {activeAction === 'chocolate' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                    >
                        <div className="bg-white p-8 rounded-[2rem] shadow-2xl flex flex-col items-center max-w-sm w-full border border-pink-100">
                            <h3 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-pink-600 mb-6 text-center">Yummy! 🍫</h3>
                            <img
                                src="https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcT3Q2vpwOY7fh1Hj39gI8KW_E36HVddDZ26ozC74O-hZhkjJsJ-JHp2jCDx27lzVw9G3uuTFJ1Y-KR5H43E6MUO6Kt2PODAsfZkYEQ_j-Lc1i2RBbF1YLCHfdEE7-1LZvDYb-laZQ&usqp=CAc"
                                alt="Eating chocolates cute"
                                className="w-48 h-48 object-cover rounded-2xl mb-8 shadow-inner"
                            />
                            <button onClick={() => closeAction(15)} className="w-full py-4 bg-gradient-to-r from-amber-500 to-pink-500 text-white font-bold rounded-full shadow-lg hover:-translate-y-1 active:scale-95 transition-all text-xl">
                                Nom Nom Nom 😋
                            </button>
                        </div>
                    </motion.div>
                )}

                {activeAction === 'joke' && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                    >
                        <div className="bg-white p-8 rounded-[2rem] shadow-2xl flex flex-col items-center max-w-sm w-full border border-yellow-200">
                            <div className="text-5xl mb-4">🤡</div>
                            <h3 className="text-2xl font-bold text-yellow-500 mb-6 text-center">You ready for this?</h3>
                            <p className="text-gray-700 text-xl font-medium text-center mb-8 leading-relaxed">
                                "{currentJoke}"
                            </p>
                            <button onClick={() => closeAction(25)} className="w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-bold rounded-full shadow-lg hover:-translate-y-1 active:scale-95 transition-all text-xl">
                                Haha, so lame! 😂
                            </button>
                        </div>
                    </motion.div>
                )}

                {activeAction === 'sorry' && (
                    <CanvasTree onClose={() => closeAction(20)} />
                )}
            </AnimatePresence>

            {/* Subtle atmospheric particles for "Ghibli" feel */}
            {Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-white opacity-40 blur-[1px] pointer-events-none"
                    initial={{ x: Math.random() * 100 + 'vw', y: Math.random() * 100 + 'vh' }}
                    animate={{
                        y: [null, Math.random() * 100 + 'vh'],
                        opacity: [0.2, 0.6, 0.2]
                    }}
                    transition={{ duration: Math.random() * 5 + 5, repeat: Infinity, ease: 'linear' }}
                />
            ))}
        </motion.div>
    );
}
