import request from "../../API";

const profileAPI = {};

profileAPI.getUserDetails = async (userId) => {
    try {
        // Twitch API endpoint to get a user profile by id
        const response = await request('get', `users?id=${userId}`);
        if (response.status === 200) {
            // Twitch returns an array of users; extract the first entry.
            const profile = response.data.data[0];
            // Optionally dispatch an action to store the user profile.
            return profile;
        } else {
            console.error('Failed to fetch user profile');
        }
    } catch (error) {
        console.error("Error fetching user profile:", error);
    }
};

export default profileAPI