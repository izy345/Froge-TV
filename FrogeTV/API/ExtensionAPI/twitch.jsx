import request from "..";

const TwitchExtension = {};

/**
 * Fetches the current broadcast details for the given user ID.
 * If the stream is offline, the returned data array will be empty.
 *
 * @param {string} userId - The broadcaster's user ID.
 * @param {string} accessToken - A valid OAuth access token with the required scopes.
 * @param {string} clientId - Your Twitch Client-ID.
 * @returns {Promise<Object|null>} - The stream details object if live, otherwise null.
 */
TwitchExtension.getStreamDetails = async (userId) => {
    try {
        const response = await request("get", "https://api.twitch.tv/helix/streams",{ 
            user_id: userId 
        });
        // The Twitch API returns an array in data. If empty, the stream is offline.
        const streamDetails = response.data?.data[0] || null;
        return streamDetails;
    } catch (error) {
        console.error("Error fetching stream details:", error);
        throw error;
    }
};

export default TwitchExtension;
