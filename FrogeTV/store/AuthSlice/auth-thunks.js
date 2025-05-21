import { Alert } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import request from '../../API';
import { saveToken } from '../../secure';
import { authSliceActions } from './auth-slice';


const authActions = {}

const twitchClientId = 'rwnbtp0uxgh6pixldu20vafb069i35';

const scopes = ['user:read:email'];

const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });

const authUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${twitchClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(scopes.join(' '))}`;

// currently unused
authActions.handleLogin = () => {
    return async (dispatch, getState) => {
        try{
            const authResult = await AuthSession.startAsync({ authUrl })
            if (authResult.type === 'success') {
                // Twitch returns the token in the URL fragment
                const { access_token } = authResult.params;
                console.log('access_token', access_token);
                dispatch(authSliceActions.setIsLoggedin(true));
                dispatch(authSliceActions.setAccessToken(access_token));
                saveToken('access_token', access_token);

            } else {
                console.error('Authentication canceled or failed', authResult);
                return null;
            }
        } catch (error) {
            console.error('Twitch login error:', error);
            return null;
        }
        
    };
};

export default authActions