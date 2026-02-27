import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, AnimatePresence } from 'framer-motion';

type ItemType = 'heart' | 'sorry' | 'grumpy';

interface FallingItem {
    id: number;
    type: ItemType;
    emoji: string;
    x: number; // 0 to 100 percentage
    y: number; // 0 to 120 percentage
    speed: number;
}

const ITEMS: { type: ItemType; emoji: string; weight: number }[] = [
    { type: 'heart', emoji: '❤️', weight: 40 },
    { type: 'sorry', emoji: '🥺', weight: 40 },
    { type: 'grumpy', emoji: '😠', weight: 20 },
];

export default function StageCatchSorries({ onNext }: { onNext: () => void }) {
    const [score, setScore] = useState(0);
    const [items, setItems] = useState<FallingItem[]>([]);
    const [isWon, setIsWon] = useState(false);

    const basketX = useMotionValue(50); // percentage 0-100
    const containerRef = useRef<HTMLDivElement>(null);
    const requestRef = useRef<number>(0);
    const itemsRef = useRef<FallingItem[]>([]);
    const scoreRef = useRef(0);
    const lastSpawnTime = useRef(Date.now());

    const TARGET_SCORE = 10;

    // Sync ref with state for collision loop
    useEffect(() => {
        scoreRef.current = score;
        if (score >= TARGET_SCORE && !isWon) {
            setIsWon(true);
        }
    }, [score, isWon]);

    useEffect(() => {
        if (isWon) return;

        const gameLoop = () => {
            const now = Date.now();

            // Spawn new items every 800ms
            if (now - lastSpawnTime.current > 800) {
                lastSpawnTime.current = now;

                // Random item based on weight
                const rand = Math.random() * 100;
                let selectedType: ItemType = 'heart';
                let cumulative = 0;
                for (const item of ITEMS) {
                    cumulative += item.weight;
                    if (rand < cumulative) {
                        selectedType = item.type;
                        break;
                    }
                }

                const newItem: FallingItem = {
                    id: now,
                    type: selectedType,
                    emoji: ITEMS.find(item => item.type === selectedType)?.emoji || '❤️',
                    x: Math.random() * 80 + 10,
                    y: -10,
                    speed: Math.random() * 0.5 + 0.3, // Percentage per frame
                };

                itemsRef.current = [...itemsRef.current, newItem];
            }

            // Update positions and check collisions
            let currentBasketX = 50;
            if (containerRef.current) {
                // Convert screen pixel pos of basket to percentage
                // Framer motion drag updates element style transform, but useMotionValue tracks it
                // We'll just read from motion value and assume it maps well to screen
                // Wait, drag="x" bounding box is easier. Let's just track normalized 0-100 coords.
                const pxBasketX = basketX.get();
                const containerWidth = containerRef.current.clientWidth;
                // Transform dx to percentage
                currentBasketX = 50 + (pxBasketX / containerWidth) * 100;
            }

            setItems(prevItems => {
                let nextItems = prevItems.map(item => ({ ...item, y: item.y + item.speed }));

                // Collision detection
                nextItems = nextItems.filter(item => {
                    // Basket is roughly around y: 85-95, width: 20% around currentBasketX
                    const inYRange = item.y > 80 && item.y < 95;
                    const inXRange = Math.abs(item.x - currentBasketX) < 15;

                    if (inYRange && inXRange) {
                        // Collision!
                        if (item.type === 'heart' || item.type === 'sorry') {
                            setScore(s => Math.min(TARGET_SCORE, s + 1));
                        } else if (item.type === 'grumpy') {
                            setScore(s => Math.max(0, s - 1));
                        }
                        return false; // Remove caught item
                    }

                    // Remove if off screen
                    if (item.y > 110) return false;

                    return true;
                });

                itemsRef.current = nextItems;
                return nextItems;
            });

            requestRef.current = requestAnimationFrame(gameLoop);
        };

        requestRef.current = requestAnimationFrame(gameLoop);
        return () => cancelAnimationFrame(requestRef.current!);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isWon]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative w-full h-[100dvh] bg-gradient-to-br from-[#f8f1fc] via-[#fdf2f8] to-[#fce7f3] overflow-hidden flex flex-col items-center select-none"
            ref={containerRef}
        >
            <button
                onClick={onNext}
                className="absolute top-4 right-4 z-50 px-5 py-2.5 bg-white/80 backdrop-blur-md rounded-full text-pink-500 font-bold shadow-sm border border-pink-100 hover:bg-white hover:shadow-md hover:scale-105 active:scale-95 transition-all text-sm tracking-wide"
            >
                Skip ➡
            </button>

            <div className="z-10 mt-16 text-center px-4 w-full max-w-sm pointer-events-none">
                <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 drop-shadow-sm mb-3" style={{ fontFamily: "'Nunito', 'Quicksand', sans-serif" }}>
                    Catch My Love! 🧺
                </h2>
                <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-pink-100 mb-6 mx-2">
                    <p className="text-gray-600 font-medium text-sm md:text-base leading-relaxed">
                        Slide the basket to catch <br />
                        <span className="font-bold text-rose-500">10 Hearts ❤️</span> or <span className="font-bold text-orange-500">Sorries 🥺</span>.<br />
                        Avoid my <span className="font-bold text-purple-600">Grumpy Faces 😠</span>!
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-white/80 rounded-full h-5 backdrop-blur-sm border border-pink-200 overflow-hidden shadow-inner flex items-center px-1">
                    <motion.div
                        className="bg-gradient-to-r from-pink-400 to-purple-400 h-3 rounded-full shadow-[0_0_10px_rgba(236,72,153,0.5)]"
                        animate={{ width: `${(score / TARGET_SCORE) * 100}%` }}
                        transition={{ type: "spring", bounce: 0.2 }}
                    />
                </div>
                <p className="font-bold text-pink-500 mt-3 text-lg">{score} / {TARGET_SCORE}</p>
            </div>

            {/* Falling Items */}
            {items.map(item => (
                <div
                    key={item.id}
                    className="absolute text-4xl drop-shadow-lg z-10 pointer-events-none"
                    style={{
                        left: `${item.x}%`,
                        top: `${item.y}%`,
                        transform: 'translateX(-50%)'
                    }}
                >
                    {item.emoji}
                </div>
            ))}

            {/* Basket Wrapper to center it perfectly to match logical 50% start */}
            <div className="absolute bottom-10 left-0 w-full flex justify-center z-20 pointer-events-none">
                <motion.div
                    className="pointer-events-auto w-24 h-24 bg-white/80 backdrop-blur-md rounded-b-3xl rounded-t-lg border-2 border-pink-300 shadow-xl flex items-center justify-center text-4xl cursor-grab active:cursor-grabbing"
                    style={{ x: basketX }}
                    drag="x"
                    dragConstraints={containerRef}
                    dragElastic={0.1}
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                >
                    🧺
                </motion.div>
            </div>

            {/* Win State */}
            <AnimatePresence>
                {isWon && (
                    <motion.div
                        initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                        animate={{ opacity: 1, backdropFilter: 'blur(10px)' }}
                        className="absolute inset-0 z-50 flex items-center justify-center bg-black/20"
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white p-6 md:p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm mx-4 border border-pink-100"
                        >
                            <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4 text-center">
                                You caught all my effort! 💖
                            </h3>
                            <p className="text-gray-600 text-center mb-6 font-medium text-sm md:text-base">
                                I truly mean it. You are the best thing that ever happened to me.
                            </p>
                            <button
                                onClick={onNext}
                                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all text-lg w-full"
                            >
                                Next ➡
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
