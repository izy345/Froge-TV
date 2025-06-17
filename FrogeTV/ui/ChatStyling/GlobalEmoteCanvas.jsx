import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Canvas,
    useCanvasRef,
    useDrawCallback,
    Skia,
    Image as SkiaImage,
} from "@shopify/react-native-skia";
import { useSelector } from "react-redux";

// Layout constants
const PADDING = 2; // Pixels between emotes
const INITIAL_SIZE = 128;

// Helper to layout emotes in rows (basic greedy packer)
function layoutAtlas(emotes, maxWidth = 2048) {
    const layout = {};
    let x = 0,
        y = 0,
        rowHeight = 0;
    let atlasWidth = INITIAL_SIZE,
        atlasHeight = INITIAL_SIZE;

    for (const emote of emotes) {
        if (!emote || !emote.width || !emote.height || !emote.frames?.[0])
            continue;

        if (x + emote.width + PADDING > maxWidth) {
            x = 0;
            y += rowHeight + PADDING;
            rowHeight = 0;
        }

        layout[emote.emoteId] = {
            x,
            y,
            width: emote.width,
            height: emote.height,
        };

        x += emote.width + PADDING;
        rowHeight = Math.max(rowHeight, emote.height);
        atlasWidth = Math.max(atlasWidth, x);
        atlasHeight = Math.max(atlasHeight, y + rowHeight);
    }

    return { layout, width: atlasWidth, height: atlasHeight };
}

export const useGlobalEmoteAtlas = () => {
    return useSelector((state) => state.cache.globalEmoteAtlas ?? {});
};

export default function GlobalEmoteCanvas() {
    const emoteCache = useSelector((state) => state.cache.emoteCache);
    const canvasRef = useCanvasRef();
    const [atlasLayout, setAtlasLayout] = useState({});
    const [canvasSize, setCanvasSize] = useState({
        width: INITIAL_SIZE,
        height: INITIAL_SIZE,
    });

    const draw = useDrawCallback(
        (canvas, info) => {
            canvas.clear(Skia.Color("transparent"));

            emoteCache.forEach((emote) => {
                const frame = emote.frames?.[0]; // First frame only
                const layout = atlasLayout[emote.emoteId];
                if (frame && layout) {
                    canvas.drawImageRect(
                        frame,
                        {
                            x: 0,
                            y: 0,
                            width: emote.width,
                            height: emote.height,
                        },
                        layout
                    );
                }
            });
        },
        [atlasLayout, emoteCache]
    );

    // Update atlas layout when emotes change
    useEffect(() => {
        const { layout, width, height } = layoutAtlas(emoteCache);
        setAtlasLayout(layout);
        setCanvasSize({ width, height });
    }, [emoteCache]);

    return (
        <Canvas
            ref={canvasRef}
            style={{
                width: canvasSize.width,
                height: canvasSize.height,
                position: "absolute",
                top: -9999,
                left: -9999,
            }}
            onDraw={draw}
        />
    );
}

export { layoutAtlas };
