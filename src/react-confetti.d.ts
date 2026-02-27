declare module 'react-confetti' {
    import { ComponentType } from 'react';

    export interface Props {
        width?: number;
        height?: number;
        numberOfPieces?: number;
        friction?: number;
        wind?: number;
        gravity?: number;
        colors?: string[];
        opacity?: number;
        recycle?: boolean;
        run?: boolean;
        initialVelocityX?: number;
        initialVelocityY?: number;
        tweenDuration?: number;
        drawShape?: (ctx: CanvasRenderingContext2D) => void;
        onConfettiComplete?: (confetti: any) => void;
        style?: React.CSSProperties;
        className?: string;
    }

    const Confetti: ComponentType<Props>;
    export default Confetti;
}
