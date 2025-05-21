import { Alert } from 'react-native';
import { streamSliceActions } from './stream-slice';
import request, { requestURL } from '../../API';
import profileAPI from '../../API/Profile';
// const { profile_image_url } = await profileAPI.getUserDetails(user_id)
const streamActions = {}

// const accessToken = store.getState().auth.access_token ?? '';

streamActions.getTwitchBadges = (broadcasterId) => {
    return async (dispatch, getState) => {
        try {
            // Get channel chat badges
            const response = await request('get', 'chat/badges', {
                broadcaster_id: broadcasterId,
            });

            // Parse each channel badge set.
            // For each badge set, and each version, return a new object containing:
            // set_id, id, description, and url (using image_url_2x)
            const parsedChannelBadges = response.data.data
                .flatMap(badgeSet =>
                    badgeSet.versions.map(version => ({
                        set_id: badgeSet.set_id,
                        id: version.id,
                        description: version.description,
                        url: version.image_url_2x,
                    }))
                );

            // Get global chat badges
            const globalResponse = await request('get', 'chat/badges/global');
            // Format global badges in the same way
            const parsedGlobalBadges = globalResponse.data.data
                .flatMap(badgeSet =>
                    badgeSet.versions.map(version => ({
                        set_id: badgeSet.set_id,
                        id: version.id,
                        description: version.description,
                        url: version.image_url_2x,
                    }))
                );

            // Merge all badges into one array
            const allBadges = [...parsedChannelBadges, ...parsedGlobalBadges];

            // Log one example for context
            dispatch(streamSliceActions.setTwitchBadges(allBadges));
        } catch (error) {
            console.error("Error fetching Twitch badges:", error);
            // Optional: show an alert or handle the error in your UI.
        }
    };
};

streamActions.checkSubscription = (broadcasterId) => {
    return async (dispatch, getState) => {
        const userId = getState().auth.userId;
        if (!userId) return false
        try {
            const response = await request('get','subscriptions/user', {
                    broadcaster_id: broadcasterId,
                    user_id: userId,
            });
            // If the user is subscribed, the data array will have a member
            return  response.data?.data?.length > 0;
        } catch (error) {
            console.error('Error checking subscription:', error);
            return false;
        }
    }
}


streamActions.getTwitchEmotes = (broadcaster_id, allowChannelEmotes = false) => {
    return async (dispatch, getState) => {
        try {
            

            const thisUserId = getState().auth.userId;
            const response = await request('get', 'chat/emotes', {
                broadcaster_id: broadcaster_id,
            });

            // For each emote:
            // - Create a new object with keys:
            //      'emoteName': emote.name
            //      'emoteUrl': use emote.images.url_2x, but if emote.format includes 'animated',
            //                 replace '/static/' with '/animated/' in the URL.
            let parsedEmotes = [];
            if (await dispatch(streamActions.checkSubscription(broadcaster_id)) || allowChannelEmotes) {
                parsedEmotes = response.data.data.map(emote => {
                    const hasAnimated = emote.format.includes("animated");
                    const originalUrl = emote.images.url_2x;
                    const newEmoteUrl = hasAnimated
                        ? originalUrl.replace('/static/', '/animated/')
                        : originalUrl;
                    return {
                        emoteName: emote.name,
                        emoteUrl: newEmoteUrl,
                        emoteId: emote.id,
                        type: 'Twitch-Channel',
                    };
                });
            }
            // global emotes
            const globalResponse = await request('get', 'chat/emotes/global');
            const parsedGlobalEmotes = globalResponse.data.data.map(emote => {
                const hasAnimated = emote.format.includes("animated");
                const originalUrl = emote.images.url_2x;
                const newEmoteUrl = hasAnimated
                    ? originalUrl.replace('/static/', '/animated/')
                    : originalUrl;
                return {
                    emoteName: emote.name,
                    emoteUrl: newEmoteUrl,
                    emoteId: emote.id,
                    type: 'Twitch-Global',
                };
            });

            // Fetch user-specific emotes with pagination
            let userEmotesRaw = [];
            let userEmotesParsed = [];
            if (thisUserId) {
                let cursor = null;
                do {
                    const params = { user_id: thisUserId, first: 100 };
                    if (cursor) params.after = cursor;
                    const userEmoteResponse = await request("get", "chat/emotes/user", params);
                    userEmotesRaw = userEmotesRaw.concat(userEmoteResponse.data.data);
                    cursor = userEmoteResponse.data.pagination?.cursor || null;
                } while (cursor);
                //console.log("user emotes:", userEmotesRaw);

                // A cache to avoid multiple API calls for an owner_id
                const ownerCache = {};

                // Parse user-specific emotes using the provided URL pattern.
                // If emote.emote_type is "follower" or "subscriptions", fetch and cache owner_login.
                userEmotesParsed = userEmotesRaw.length > 0
                    ? await Promise.all(
                        userEmotesRaw.map(async (emote) => {
                            let ownerLogin;
                            if (( emote.emote_type === 'follower' || emote.emote_type === 'subscriptions') && emote.owner_id) {
                                if (!ownerCache[emote.owner_id]) {
                                    try {
                                        const { display_name } = await profileAPI.getUserDetails(emote.owner_id);
                                        ownerCache[emote.owner_id] = display_name;
                                    } catch (error) {
                                        console.error(`Error fetching details for owner ${emote.owner_id}:`, error);
                                        ownerCache[emote.owner_id] = undefined;
                                    }
                                }
                                ownerLogin = ownerCache[emote.owner_id];
                            }
                            const format = (emote.format && emote.format[1]) || 'static';
                            const scale = '2.0' || (emote.scale && emote.scale[0]);
                            const theme = (emote.theme_mode && emote.theme_mode[0]) || 'light';
                            const emoteUrl = `https://static-cdn.jtvnw.net/emoticons/v2/${emote.id}/${format}/${theme}/${scale}`;
                            return {
                                emoteName: emote.name,
                                emoteUrl,
                                emoteId: emote.id,
                                type: `Twitch-${ownerLogin ?? 'Unlocked'}`,
                            };
                        })
                    )
                    : [];
            }
            // check
            // Remove duplicates from userEmotesParsed if the emote name is also present in parsedGlobalEmotes
            userEmotesParsed = userEmotesParsed.filter(emote => 
                !parsedGlobalEmotes.some(globalEmote => globalEmote.emoteName === emote.emoteName)
            );
            
            // Next, remove duplicates from userEmotesParsed if the emote name is also present in parsedEmotes
            userEmotesParsed = userEmotesParsed.filter(emote => 
                !parsedEmotes.some(channelEmote => channelEmote.emoteName === emote.emoteName)
            );

            dispatch(streamSliceActions.setTwitchEmotes([...parsedGlobalEmotes, ...userEmotesParsed]));
            dispatch(streamSliceActions.setLocalTwitchEmotes(parsedEmotes));
        } catch (error) {
            console.error('Could not fetch emotes.', error);
        }
    };
};

// unused for now
streamActions.getTwitchEmotesFromSet = (userId) => {
    return async (dispatch, getState) => {
        try {
            // Replace the URL and request params with the appropriate API endpoint
            // that returns the unlocked emote sets for a given chatter.
            const response = await request('get', `chat/emotes/user`, { user_id: userId });
            console.log("this:",response)
            // Parse and format the fetched emotes similar to what you do for Twitch emotes.
            const parsedEmotes = response.data.data.map(emote => {
                const hasAnimated = emote.format.includes("animated");
                const originalUrl = emote.images.url_2x;
                const newEmoteUrl = hasAnimated
                    ? originalUrl.replace('/static/', '/animated/')
                    : originalUrl;
                return {
                    emoteId: emote.id,
                    emoteName: emote.name,
                    emoteUrl: newEmoteUrl,
                    setId: emote.emote_set, // if available
                    type: 'Twitch-set', // or appropriate type
                };
            });
            // Dispatch an action to add these emotes to your existing state.
            dispatch(streamSliceActions.addTwitchEmotes(parsedEmotes));
        } catch (error) {
            console.error('Could not fetch chatter emotes.', error);
        }
    }
}

streamActions.get7TVEmotes = (broadcaster_id) => {
    return async (dispatch, getState) => {
        try {
            const show7TVEmotes = getState().config.show7TVEmotes;
            if (!show7TVEmotes) {
                dispatch(streamSliceActions.setSeventTVEmotes([]));
                dispatch(streamSliceActions.setLocalSevenTVEmotes([]));
                return
            };
            // Fetch global 7TV emotes
            const globalResponse = await requestURL('get', 'https://7tv.io/v3/emote-sets/global');
            const globalEmotes = globalResponse.data?.emotes ?? [];

            const parsedGlobalEmotes = globalEmotes.map(emote => {
                const file2x = emote.data.host.files.find(file => file.name.startsWith("2x."));
                return {
                    emoteName: emote.name,
                    emoteUrl: `https://cdn.7tv.app/emote/${emote.id}/${file2x ? file2x.name : '2x.webp'}`,
                    width: file2x ? file2x.width * 0.5 : 32,
                    height: file2x ? file2x.height * 0.5 : 32,
                    flag: Array.isArray(emote.data.flags)
                        ? emote.data.flags
                        : (emote.data.flags ? [emote.data.flags] : []),
                    type: '7TV-Global',
                };
            });

            // Fetch channel-specific 7TV emotes using the Twitch broadcaster_id.
            const channelResponse = await requestURL('get', `https://7tv.io/v3/users/twitch/${broadcaster_id}`);
            const channelEmotes = channelResponse.data?.emote_set?.emotes ?? [];

            const parsedChannelEmotes = channelEmotes.map(emote => {
                const file2x = emote.data.host.files.find(file => file.name.startsWith("2x."));
                return {
                    emoteName: emote.name,
                    emoteUrl: `https://cdn.7tv.app/emote/${emote.id}/${file2x ? file2x.name : '2x.webp'}`,
                    width: file2x ? file2x.width * 0.5 : 32,
                    height: file2x ? file2x.height * 0.5 : 32,
                    flag: Array.isArray(emote.data.flags)
                        ? emote.data.flags
                        : (emote.data.flags ? [emote.data.flags] : []),
                    type: '7TV-Channel',
                };
            });
            // Merge both sets into one list
            //const all7TVEmotes = [...parsedGlobalEmotes, ...parsedChannelEmotes];
            dispatch(streamSliceActions.setSeventTVEmotes(parsedGlobalEmotes));
            dispatch(streamSliceActions.setLocalSevenTVEmotes(parsedChannelEmotes));
        } catch (error) {
            console.error("Could not fetch 7TV emotes.", error);
        }
    };
};

streamActions.getBTTVBadges = () => {
    return async (dispatch, getState) => {
        try {
            const response = await requestURL('get', `https://api.betterttv.net/3/cached/badges/twitch`);
            dispatch(streamSliceActions.setBTTVBadges(response.data));
            //console.log('BTTV Badges:', response.data[0]);
        } catch (error) {
            console.warn("Could not fetch BTTV badges.", error);
        }
    }
}

streamActions.getBTTVEmotes = (broadcaster_id) => {
    return async (dispatch, getState) => {
        try {
            const showBTTVEmotes = getState().config.showBTTVEmotes;
            if (!showBTTVEmotes) {
                dispatch(streamSliceActions.setBTTVEmotes([]));
                dispatch(streamSliceActions.setLocalBTTVEmotes([]));
                return
            };
            let parsedChannelEmotes = []
            try {
                const channelEmotes = await requestURL('get', `https://api.betterttv.net/3/cached/users/twitch/${broadcaster_id}`)
                const channelData = channelEmotes.data;
                const parsedThisChannelEmotes = channelData.channelEmotes.map(emote => ({
                    emoteName: emote.code,
                    emoteUrl: `https://cdn.betterttv.net/emote/${emote.id}/2x.webp`,
                    width: emote.width ? emote.width : 32,
                    height: emote.height ? emote.height : 32,
                    flag: Array.isArray(emote.modifier)
                        ? emote.modifier.map(mod => String(mod))
                        : (emote.hasOwnProperty("modifier") ? [String(emote.modifier)] : []),
                    type: 'BTTV-Channel',

                }));

                const parsedSharedEmotes = channelData.sharedEmotes.map(emote => ({
                    emoteName: emote.code,
                    emoteUrl: `https://cdn.betterttv.net/emote/${emote.id}/2x.webp`,
                    width: emote.width ? emote.width : 32,
                    height: emote.height ? emote.height : 32,
                    flag: Array.isArray(emote.modifier)
                        ? emote.modifier.map(mod => String(mod))
                        : (emote.hasOwnProperty("modifier") ? [String(emote.modifier)] : []),
                    type: 'BTTV-Channel',
                }));

                parsedChannelEmotes = [...parsedThisChannelEmotes, ...parsedSharedEmotes]

            } catch (error) {
                parsedChannelEmotes = []
            }
            const globalEmotes = await requestURL('get', 'https://api.betterttv.net/3/cached/emotes/global')
            //const emote = globalEmotes.data.find(emote => emote.code === 'cvMask');
            //console.log('that emote:', emote)
            const parsedGlobalEmotes = globalEmotes.data.map(emote => {
                return {
                    emoteName: emote.code,
                    emoteUrl: `https://cdn.betterttv.net/emote/${emote.id}/2x.webp`,
                    flag: Array.isArray(emote.modifier)
                        ? emote.modifier.map(mod => String(mod))
                        : (emote.hasOwnProperty("modifier") ? [String(emote.modifier)] : []),
                    type: 'BTTV-Global',
                };
            });
            //const allBTTVEmotes = [...parsedChannelEmotes, ...parsedGlobalEmotes];
            dispatch(streamSliceActions.setBTTVEmotes(parsedGlobalEmotes));
            dispatch(streamSliceActions.setLocalBTTVEmotes(parsedChannelEmotes));
        } catch (error) {
            console.error("Could not fetch BTTV emotes.", error);
        }
    }
}

streamActions.getFFZBadges = () => {
    return async (dispatch, getState) => {
        try {
            const response = await requestURL('get', 'https://api.frankerfacez.com/v1/badges/ids');
            //console.log('FFZ Badges:', response.data);
            dispatch(streamSliceActions.setFFZBadges(response.data));
        } catch (error) {
            console.warn("Could not fetch FFZ badges.", error);
        }
    }
}

streamActions.getFFZEmotes = (broadcaster_id) => {
    return async (dispatch, getState) => {
        let parsedEmotes = []
        let parsedChannelEmotes = []
        try {
            const showFFZEmotes = getState().config.showFFZEmotes;
            if (!showFFZEmotes) {
                dispatch(streamSliceActions.setFFZEmotes([]));
                dispatch(streamSliceActions.setLocalFFZEmotes([]));
                return
            };
            

            // Fetch Global FFZ Emotes
            const globalResponse = await requestURL("get", "https://api.frankerfacez.com/v1/set/global");
            if (globalResponse.status === 200) {
                const decoded = globalResponse.data;
                const defaultSets = decoded.default_sets; // e.g., [1, 2, 6]
                defaultSets.forEach((setId) => {
                    const setData = decoded.sets[setId.toString()];
                    if (setData && setData.emoticons) {
                        parsedEmotes = setData.emoticons.map((emote) => {
                            return {
                                emoteName: emote.name,
                                // Use resolution "1" if available.
                                emoteUrl: emote.urls && emote.urls["1"] ? emote.urls["1"] : "",
                                width: 32,
                                height: 32,
                                type: "FFZ-Global",
                            };
                        });

                    }
                });
            } else {
                console.error("Failed to get FFZ global emotes");
            }

            // Fetch Channel-specific FFZ Emotes
            const roomResponse = await requestURL("get", `https://api.frankerfacez.com/v1/room/id/${broadcaster_id}`);
            if (roomResponse.status === 200) {
                const roomData = roomResponse.data;
                const roomSet = roomData.room.set; // The set id for the room
                const channelSet = roomData.sets[roomSet.toString()];
                if (channelSet && channelSet.emoticons) {
                    parsedChannelEmotes = channelSet.emoticons.map((emote) => {
                        return {
                            emoteName: emote.name,
                            emoteUrl: emote.urls && emote.urls["1"] ? emote.urls["1"] : "",
                            width: 32,
                            height: 32,
                            type: "FFZ-Channel",
                        };
                    });

                }
            } else {
                console.warn("No FFZ channel emotes found for this broadcaster.");
            }

            dispatch(streamSliceActions.setFFZEmotes(parsedEmotes));
            dispatch(streamSliceActions.setLocalFFZEmotes(parsedChannelEmotes));
        } catch (error) {
            console.error("Error fetching FFZ global and channel emotes", error);
        }
    };
};


export default streamActions

// Subscribe to all entitlement and cosmetic events on a specific channel
// : GET https://events.7tv.io/v3@entitlement.*<host_id=60867b015e01df61570ab900;connection_id=1234>,cosmetic.*<host_id=60867b015e01df61570ab900;connection_id=1234>

