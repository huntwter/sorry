import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import StageAngerMeter from './components/StageAngerMeter.tsx';
import StageFinaleHug from './components/StageFinaleHug.tsx';

function App() {
  const [stage, setStage] = useState(0);

  const nextStage = () => setStage((prev) => prev + 1);

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden font-sans bg-gray-50">
      <AnimatePresence mode="wait">
        {stage === 0 && <StageAngerMeter key="stage-0" onNext={nextStage} />}
        {stage === 1 && <StageFinaleHug key="stage-1" />}
      </AnimatePresence>
    </div>
  );
}

export default App;
