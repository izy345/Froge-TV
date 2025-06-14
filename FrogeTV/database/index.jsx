import * as SQLite from "expo-sqlite";
import EmoteGifEncoderModule from "../modules/emote-gif-encoder/src/EmoteGifEncoderModule";
import { Alert } from "react-native";

const database = SQLite.openDatabaseSync("FrogeTV.db");
// emoteUrl, timeIndex, base64Frames, frameDurations, totalNumberOfFrames
export function init() {
    return database.runAsync(`
        CREATE TABLE IF NOT EXISTS AnimatedEmotes (
            emoteUrl TEXT NOT NULL,
            timeIndex TEXT NOT NULL,
            base64Frames TEXT NOT NULL,
            totalNumberOfFrames TEXT NOT NULL,
            usageCount INTEGER DEFAULT 0,
            PRIMARY KEY (emoteUrl, timeIndex)
        )
    `);
}

export async function fetchBase64Data(emoteUrl, timeIndex) {
    try {
        const result = await database.getFirstAsync(
            "SELECT * FROM AnimatedEmotes WHERE emoteUrl = ? AND timeIndex = ?",
            [emoteUrl, timeIndex]
        );
        if (!result) {
            //console.warn(`No emote found with url: ${emoteUrl} and timeIndex: ${timeIndex}`);
        }
        return result || null;
    } catch (error) {
        console.warn(`Error fetching place details for id: ${id}`, error);
        return null
        //throw error;
    }
}

export async function insertAnimatedEmote(animatedEmote, base64Frames, frameDurations) {
    //console.log("[Database] insertPlace called with:", animatedEmote);
    const encodedBase64 = await EmoteGifEncoderModule.encodeGif(base64Frames, frameDurations);
    const formattedBase64Frames = `data:image/gif;base64,${encodedBase64}`;
    try {
        console.log
        const result = await database.runAsync(
            `
            INSERT INTO AnimatedEmotes (emoteUrl, timeIndex, base64Frames, totalNumberOfFrames, usageCount)
            VALUES (?, ?, ?, ?, 0)
            `,
            [
                animatedEmote.emoteUrl,
                animatedEmote.timeIndex,
                formattedBase64Frames,
                animatedEmote.totalNumberOfFrames,
            ]
        );
        //console.warn("runAsync returned:", result);
        if (result && result.changes === 1) {
            //console.log("[Database] Insert succeeded.", result);
            return fetchBase64Data(animatedEmote.emoteUrl, animatedEmote.timeIndex);
        } else {
            console.warn("[Database] Insert failed.", animatedEmote.timeIndex);
            //throw new Error("Insert failed");
        }
    } catch (error) {
        //console.warn("Error inserting Emote: ",animatedEmote.emoteUrl, 'on index ', animatedEmote.timeIndex,' reason provided:', error);
        return fetchBase64Data(animatedEmote.emoteUrl, animatedEmote.timeIndex)
        //throw error;
    }
}

export async function updateAnimatedEmoteRange(animatedEmote, range = 0, base64Frames, frameDurations) {
    //console.log("[Database] updateAnimatedEmote called with:", animatedEmote, "with range =", range);
    try {
        let matchTimeIndex = animatedEmote.timeIndex;

        range = animatedEmote.totalNumberOfFrames > 25 ? Math.max(range, Math.max(1, Math.floor(animatedEmote.totalNumberOfFrames * 0.02))) : 0;

        if (range > 0) {
            // Fetch all possible timeIndex values for this emoteUrl
            const queryResult = await database.getAllAsync(
                `
                SELECT timeIndex FROM AnimatedEmotes
                WHERE emoteUrl = ?
                `,
                [animatedEmote.emoteUrl]
            );

            const total = parseInt(animatedEmote.totalNumberOfFrames);
            const target = parseInt(animatedEmote.timeIndex);

            const normalize = (n, mod) => ((n % mod) + mod) % mod;

            const match = queryResult.find((row) => {
                const stored = parseInt(row.timeIndex);
                const diff = Math.min(
                    normalize(target - stored, total),
                    normalize(stored - target, total)
                );
                return diff <= range;
            });

            if (match) {
                matchTimeIndex = match.timeIndex;
                //console.log(`[Database] Forgiving match found: ${matchTimeIndex}`);
            } else {
                //console.warn("[Database] No matching timeIndex found within forgiveness window");
                return insertAnimatedEmote(animatedEmote, base64Frames, frameDurations)
            }
        }
        const result = await database.runAsync(
            `
            UPDATE AnimatedEmotes
            SET usageCount = CASE 
                WHEN usageCount < 3 THEN usageCount + 1 
                ELSE 3 
            END
            WHERE emoteUrl = ? AND timeIndex = ?
            `,
            [
                animatedEmote.emoteUrl,
                matchTimeIndex,
            ]
        );

        if (result && result.changes === 1) {
            //console.log("[Database] Update succeeded.", result);
            return fetchBase64Data(animatedEmote.emoteUrl, matchTimeIndex);
        } else {
            //console.warn("[Database] No rows updated after forgiving match check.", result);
            return insertAnimatedEmote(animatedEmote, base64Frames, frameDurations);
        }
    } catch (error) {
        console.error("Error updating AnimatedEmote in function updateAnimatedEmoteRange():", error);
        //throw error;
    }
}

export async function pruneOldEntriesIfNeeded(maxAmount) {
    if (maxAmount !== null && maxAmount !== undefined) {
        const countResult = await database.getFirstAsync(
            "SELECT COUNT(*) as count FROM AnimatedEmotes"
        );

        const currentCount = (countResult && countResult.count) || 0;

        if (currentCount > maxAmount) {
            const deleteCount = currentCount - maxAmount;

            const toDelete = await database.getAllAsync(
                `
        SELECT emoteUrl, timeIndex FROM AnimatedEmotes
        ORDER BY usageCount ASC
        LIMIT ?
        `,
                [deleteCount]
            );

            for (let i = 0; i < toDelete.length; i++) {
                const entry = toDelete[i];
                await database.runAsync(
                    `
                    DELETE FROM AnimatedEmotes
                    WHERE emoteUrl = ? AND timeIndex = ?
                    `,
                    [entry.emoteUrl, entry.timeIndex]
                );

                console.log(`[Database] Deleted low-usage entry: ${entry.emoteUrl} @ ${entry.timeIndex}`);
            }

            //console.log(`[Database] Pruned ${deleteCount} entries to respect maxAmount = ${maxAmount}`);
        }
    }
}



export async function clearDatabase() {
    return database.runAsync("DROP TABLE IF EXISTS AnimatedEmotes")
        .then(() => {
            console.log("Table dropped, re-initializing...");
            return init();
        })
        .catch(error => {
            console.error("Error clearing database:", error);
            throw error;
        });
}
