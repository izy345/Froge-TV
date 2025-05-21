import { store } from '../store';

export function formatTwitchGivenEmotes(message, twitchEmoteList) {
    if (!twitchEmoteList) return [];
    const formattedEmotes = [];
    const twitchEmotes = store.getState().stream.twitchEmotes;
    const localTwitchEmotes = store.getState().stream.localTwitchEmotes;
    const allEmotes = [...twitchEmotes, ...localTwitchEmotes];

    for (const [emoteId, positions] of Object.entries(twitchEmoteList)) {
        for (const pos of positions) {
            const [startStr, endStr] = pos.split("-");
            const start = parseInt(startStr, 10);
            const end = parseInt(endStr, 10);
            const emoteName = message.slice(start, end + 1);
            // Skip if an emote with the same name already exists.
            const existsInTwitch = allEmotes.find(e => e.emoteName === emoteName);
            if (existsInTwitch) continue;
            const thisEmoteURL = `https://static-cdn.jtvnw.net/emoticons/v2/${emoteId}/default/dark/2.0`;
            formattedEmotes.push({
                emoteName,
                emoteUrl: thisEmoteURL,
                emoteId,
                type: 'TwitchTV'
            });
        }
    }
    return formattedEmotes;
}