// FrameTickContext.js
import React, { createContext, useContext, useEffect, useState } from "react";

const FrameTickContext = createContext(0);

export const useFrameTick = () => useContext(FrameTickContext);

export function FrameTickProvider({ children }) {
    const [tick, setTick] = useState(() => Date.now());

    useEffect(() => {
        let mounted = true;

        const loop = () => {
            if (mounted) {
                setTick(Date.now());
                requestAnimationFrame(loop);
            }
        };

        const id = requestAnimationFrame(loop);

        return () => {
            mounted = false;
            cancelAnimationFrame(id);
        };
    }, []);

    return (
        <FrameTickContext.Provider value={tick}>
            {children}
        </FrameTickContext.Provider>
    );
}
