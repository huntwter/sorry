import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';

export default function StageFinaleHug() {
    const [isForgiven, setIsForgiven] = useState(false);
    const [escapePos, setEscapePos] = useState({ x: 0, y: 0 });
    const escapeButtonRef = useRef<HTMLButtonElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Generate random particles
    const particles = Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100, // 0 to 100%
        delay: Math.random() * 2,
        duration: Math.random() * 3 + 2,
        size: Math.random() * 1.5 + 0.5
    }));

    const handleEscape = () => {
        if (!containerRef.current || !escapeButtonRef.current) return;
        const containerRect = containerRef.current.getBoundingClientRect();
        const btnRect = escapeButtonRef.current.getBoundingClientRect();

        // Safe boundaries for the button to fly to
        const maxX = containerRect.width - btnRect.width - 40;
        const maxY = containerRect.height - btnRect.height - 40;

        const randomX = (Math.random() - 0.5) * maxX;
        // Keep it slightly constrained vertically so it doesn't go completely off-screen or cover the primary button
        const randomY = (Math.random() - 0.5) * (maxY * 0.8);

        setEscapePos({ x: randomX, y: randomY });
    };

    return (
        <motion.div
            ref={containerRef}
            initial={{ opacity: 0, backgroundColor: '#fdfaf6' }}
            animate={{ opacity: 1, backgroundColor: '#fdf2f8' }} // Creamy pink aesthetic
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="w-full h-[100dvh] relative overflow-hidden flex flex-col items-center justify-center select-none"
        >
            {isForgiven && (
                <div className="absolute inset-0 z-50 pointer-events-none">
                    <Confetti
                        width={windowSize.width}
                        height={windowSize.height}
                        recycle={false}
                        numberOfPieces={500}
                        gravity={0.12}
                        colors={['#f43f5e', '#ec4899', '#d946ef', '#f59e0b', '#10b981']}
                    />
                </div>
            )}

            {/* Glowing Aura Background */}
            <motion.div
                className="absolute inset-0 flex items-center justify-center z-0"
                animate={{ scale: [1, 1.05, 1], opacity: [0.6, 0.8, 0.6] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
                <div className="w-64 h-64 md:w-[32rem] md:h-[32rem] rounded-full bg-gradient-to-tr from-pink-300 via-rose-200 to-yellow-100 blur-[80px] opacity-70"></div>
            </motion.div>

            {/* Floating Particles */}
            {!isForgiven && particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute text-pink-400 z-10 drop-shadow-sm"
                    initial={{ y: '100dvh', x: `${p.x}vw`, opacity: 0, scale: p.size }}
                    animate={{
                        y: '-10dvh',
                        x: [`${p.x}vw`, `${p.x + 3}vw`, `${p.x - 3}vw`, `${p.x}vw`],
                        opacity: [0, 0.9, 0.9, 0]
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        delay: p.delay,
                        ease: 'linear'
                    }}
                >
                    ❤️
                </motion.div>
            ))}

            <div className="z-20 flex flex-col items-center gap-6 w-full max-w-sm px-4">
                {/* typography */}
                <AnimatePresence mode="wait">
                    {!isForgiven ? (
                        <motion.h2
                            key="sorry-text"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20, scale: 0.9 }}
                            className="text-2xl md:text-3xl font-extrabold text-gray-700 text-center leading-snug tracking-tight drop-shadow-sm"
                            style={{ fontFamily: "'Nunito', 'Quicksand', sans-serif" }}
                        >
                            I am so, so sorry, my best friend. <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">Dosti pakki? ❤️</span>
                        </motion.h2>
                    ) : (
                        <motion.div
                            key="certificate"
                            initial={{ scale: 0.8, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            transition={{ type: "spring", bounce: 0.6, duration: 0.8 }}
                            className="bg-white/95 backdrop-blur-xl px-8 py-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(236,72,153,0.2)] border-2 border-pink-100 text-center w-full relative overflow-hidden z-40"
                        >
                            {/* Decorative banner inside certificate */}
                            <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-pink-400 via-rose-400 to-yellow-400" />
                            <motion.div
                                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring' }}
                                className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4"
                            >
                                🏆
                            </motion.div>
                            <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500 mb-4 px-2" style={{ fontFamily: "'Nunito', 'Quicksand', sans-serif" }}>
                                My Cutie Friend Forever!
                            </h2>
                            <p className="text-gray-700 font-semibold text-lg md:text-xl leading-relaxed">
                                Thank you for forgiving me.<br />
                                <span className="text-rose-500 font-bold block mt-2">I love you! ❤️</span>
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Hugging Cats Flowing/Looping */}
                <motion.div
                    className="relative z-30"
                    animate={isForgiven ? { scale: [1, 1.1, 1], rotate: 0 } : { rotate: [-2, 2, -2], y: [-5, 5, -5] }}
                    transition={{ duration: isForgiven ? 2 : 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                    <img
                        src="https://i.pinimg.com/originals/f2/01/51/f20151a1f7e003426ca7f406b6f76c82.gif"
                        alt="Cute white and gray chibi cats hugging"
                        className="w-60 h-60 md:w-80 md:h-80 object-contain drop-shadow-2xl select-none"
                        draggable={false}
                    />
                </motion.div>

                {/* Buttons */}
                <AnimatePresence>
                    {!isForgiven && (
                        <motion.div
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full flex flex-col items-center gap-4 mt-2 h-40"
                        >
                            <motion.button
                                onClick={() => setIsForgiven(true)}
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                className="z-30 w-full md:w-[85%] py-4 bg-gradient-to-r from-pink-500 to-rose-400 text-white font-black rounded-2xl shadow-[0_8px_20px_rgba(244,63,94,0.4)] hover:shadow-[0_12px_25px_rgba(244,63,94,0.6)] active:scale-95 transition-all text-xl tracking-wide border border-pink-400/50"
                            >
                                Maan Gayi ❤️
                            </motion.button>

                            {/* The escaping button */}
                            <motion.button
                                ref={escapeButtonRef}
                                onMouseEnter={handleEscape}
                                onTouchStart={(e) => {
                                    e.preventDefault(); // Prevent touch from registering a click before it moves
                                    handleEscape();
                                }}
                                onClick={handleEscape}
                                animate={{ x: escapePos.x, y: escapePos.y }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                className="absolute z-20 top-20 w-[70%] md:w-3/4 py-3.5 bg-white/60 backdrop-blur-sm text-gray-500 font-bold rounded-xl shadow-sm border border-gray-200 text-lg cursor-not-allowed hover:bg-white/80"
                            >
                                Abhi Nahi... 🤔
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </motion.div>
    );
}
