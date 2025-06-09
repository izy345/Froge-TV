import React, {useRef, useMemo, useEffect} from 'react'
import ExpoPip from "expo-pip";
import { WebView } from "react-native-webview";
import { useSelector, useDispatch } from 'react-redux';
import { configSliceActions } from '../store/Configuration/config-slice';
import { StyleSheet, Text } from 'react-native';

function PIPModeAndroid() {

    //const dispatch = useDispatch();

    const pipRouteAndroid = useSelector((state) => state.config.pipRouteAndroid);


    // This effect updates pipRouteAndroid every second with the current local date/time
    /*
    useEffect(() => {
        const interval = setInterval(() => {
            const currentTime = new Date().toISOString();
            dispatch(configSliceActions.setPipAndroidEnabledOn(currentTime));
        }, 1200);
        return () => clearInterval(interval);
    }, [dispatch]);*/

    const webViewRef = useRef(null);

    const injectedJS = useMemo(() => { 
        return `
            (function() {
                // existing style injection logic
                var style = document.createElement('style');
                style.innerHTML = '.ScCoreButton-sc-ocjdkq-0.gFvFah, .ScCoreButton-sc-ocjdkq-0.yKpkn, .Layout-sc-1xcs6mc-0.dquNzJ.top-bar, .InjectLayout-sc-1i43xsx-0.hWukFy.tw-transition-group { display: none !important; }';
                document.head.appendChild(style);

                // Disable all anchor clicks
                document.querySelectorAll('a').forEach(function(a) {
                a.addEventListener('click', function(e) {
                    e.preventDefault();
                });
                });

                //Check if the video player element exists
                function checkForPlayer() {
                    var player = document.querySelector('.video-player__inactive');
                    if (player) {
                        window.ReactNativeWebView.postMessage('player-absent');
                    } else {
                        window.ReactNativeWebView.postMessage('player-present');
                    }
                }
                // Perform an initial check and then every 900ms
                checkForPlayer();
                setInterval(checkForPlayer, 900);
            })();
            true;
    `},[])

    return (
        <>
    <WebView
        ref={webViewRef}
        source={{ uri: pipRouteAndroid?.streamURL }}
        style={styles.webview}
        javaScriptEnabled={true}
        injectedJavaScriptBeforeContentLoaded={injectedJS}
        onLoadEnd={() => {
        webViewRef.current.injectJavaScript(injectedJS);
        }}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        allowsFullscreenVideo={true}
        //allowsPictureInPictureMediaPlayback={true}
    />
    </>

    )
}

export default PIPModeAndroid

const styles = StyleSheet.create({
    webview: {
        flex: 1,
    },
});