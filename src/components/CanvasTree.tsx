import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { initTreeJS } from '../utils/tree';

interface CanvasTreeProps {
    onClose: () => void;
}

export default function CanvasTree({ onClose }: CanvasTreeProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [treeGrown, setTreeGrown] = useState(false);

    const getTreeConfig = (width: number, height: number) => {
        return {
            seed: {
                x: width / 2 - 20,
                color: "rgb(236, 72, 153)",
                scale: 2
            },
            branch: [
                [535, 680, 570, 250, 500, 200, 30, 100, [
                    [540, 500, 455, 417, 340, 400, 13, 100, [
                        [450, 435, 434, 430, 394, 395, 2, 40]
                    ]],
                    [550, 445, 600, 356, 680, 345, 12, 100, [
                        [578, 400, 648, 409, 661, 426, 3, 80]
                    ]],
                    [539, 281, 537, 248, 534, 217, 3, 40],
                    [546, 397, 413, 247, 328, 244, 9, 80, [
                        [427, 286, 383, 253, 371, 205, 2, 40],
                        [498, 345, 435, 315, 395, 330, 4, 60]
                    ]],
                    [546, 357, 608, 252, 678, 221, 6, 100, [
                        [590, 293, 646, 277, 648, 271, 2, 80]
                    ]]
                ]]
            ],
            bloom: {
                num: 1000,
                width: width,
                height: height,
            },
            footer: {
                width: 1200,
                height: 5,
                speed: 10,
            }
        };
    };

    useEffect(() => {
        const customWindow = {} as any;
        initTreeJS(customWindow);
        const Tree = customWindow.Tree;

        if (!canvasRef.current || !containerRef.current) return;

        const canvas = canvasRef.current;
        // Use fixed logical dimensions for complex bezier branch logic to draw perfectly
        const width = 1080;
        const height = 650;

        canvas.width = width;
        canvas.height = height;

        const tree = new Tree(canvas, width, height, getTreeConfig(width, height));
        const seed = tree.seed;
        const foot = tree.footer;

        let isRunning = true;
        let hold = true; // Wait for user to interact with the seed

        const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

        // Let user interact sequentially by clicking heart seed to begin playback
        const handleCanvasClick = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const x = (e.clientX - rect.left) * scaleX;
            const y = (e.clientY - rect.top) * scaleY;

            if (seed.hover(x, y)) {
                hold = false;
                canvas.style.cursor = 'default';
                canvas.removeEventListener('click', handleCanvasClick as any);
                canvas.removeEventListener('mousemove', handleMouseMove as any);
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const x = (e.clientX - rect.left) * scaleX;
            const y = (e.clientY - rect.top) * scaleY;

            if (seed.hover(x, y)) {
                canvas.style.cursor = 'pointer';
            } else {
                canvas.style.cursor = 'default';
            }
        };

        canvas.addEventListener('click', handleCanvasClick as any);
        canvas.addEventListener('mousemove', handleMouseMove as any);

        const runAnimation = async () => {
            // 1. Initial State
            seed.draw();
            while (hold && isRunning) {
                await sleep(10);
            }
            if (!isRunning) return;

            // 2. Shrink Seed
            while (seed.canScale() && isRunning) {
                seed.scale(0.95);
                await sleep(10);
            }
            if (!isRunning) return;

            // 3. Move Seed Downwards
            while (seed.canMove() && isRunning) {
                seed.move(0, 2);
                foot.draw();
                await sleep(10);
            }
            if (!isRunning) return;

            // 4. Grow Tree Branches
            while (tree.canGrow() && isRunning) {
                tree.grow();
                await sleep(10);
            }
            if (!isRunning) return;

            // 5. Flower Blooms
            while (tree.canFlower() && isRunning) {
                tree.flower(2);
                await sleep(10);
            }
            if (!isRunning) return;

            // 6. Move Tree to the side
            tree.snapshot("p1", 240, 0, 610, 680);
            while (tree.move("p1", 500, 0) && isRunning) {
                foot.draw();
                await sleep(10);
            }
            foot.draw();
            tree.snapshot("p2", 500, 0, 610, 680);
            if (!isRunning) return;

            // Done planting - Show button
            setTreeGrown(true);

            // 7. Continuous Jumps and Foot Drawing 
            while (isRunning) {
                tree.ctx.clearRect(0, 0, width, height);
                tree.jump();
                foot.draw();
                await sleep(25);
            }
        };

        runAnimation();

        return () => {
            isRunning = false;
            canvas.removeEventListener('click', handleCanvasClick as any);
            canvas.removeEventListener('mousemove', handleMouseMove as any);
        };
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-[#fdf2f8] flex flex-col items-center justify-center overflow-hidden"
            ref={containerRef}
        >
            <canvas
                ref={canvasRef}
                className="w-full h-full max-w-[1080px] max-h-[700px] object-contain"
                style={{ filter: "drop-shadow(0px 10px 10px rgba(236, 72, 153, 0.2))" }}
            />

            <AnimatePresence>
                {treeGrown && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute bottom-10 z-50 w-full px-6 flex justify-center"
                    >
                        <button onClick={onClose} className="w-full max-w-sm py-4 bg-gradient-to-r from-pink-400 to-rose-400 text-white font-bold rounded-full shadow-[0_8px_20px_rgba(244,63,94,0.4)] hover:-translate-y-1 active:scale-95 transition-all text-xl">
                            So beautiful! I forgive you 🌸
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
