import { Pressable, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { useSelector, useDispatch } from "react-redux";
import { chatInputSliceActions } from "../../store/ChatInput/chatInput-slice";
import { memo, useCallback, useMemo } from "react";


function RenderEmoteItem({ item, size = 32, margin = 6, allowAutoResize = false }) {
    const dispatch = useDispatch();
    const chatInput = useSelector((state) => state.chatInput.chatInput);

    const handlePress = useCallback(() => {
        // Split the current chatInput into tokens.
        const tokens = chatInput.split(" ");
        const lastToken = tokens[tokens.length - 1] || "";
        const lowerLast = lastToken.toLowerCase();
        const lowerEmote = item.emoteName.toLowerCase();

        let newInput = "";

        if (lastToken && lowerLast === lowerEmote) {
            // Exact match: replace token with correctly capitalized emote.
            tokens[tokens.length - 1] = item.emoteName;
            newInput = tokens.join(" ");
            if (!newInput.endsWith(" ")) {
                newInput += " ";
            }
        } else if (
            lastToken &&
            lowerEmote.includes(lowerLast) &&
            lowerLast !== lowerEmote
        ) {
            // Partial match: if the token is the beginning OR the ending of the emote,
            // replace the token.
            tokens[tokens.length - 1] = item.emoteName;
            newInput = tokens.join(" ");
        } else {
            console.log("Adding emote to chatInput", item.emoteName);
            // Append the emote name, checking for trailing space.
            const trimmed = chatInput.trimEnd();
            newInput =
                trimmed === ""
                    ? item.emoteName
                    : trimmed.endsWith(" ")
                        ? `${trimmed}${item.emoteName}`
                        : `${trimmed} ${item.emoteName}`;
        }

        // Ensure newInput ends with a space.
        if (!newInput.endsWith(" ")) {
            newInput += " ";
        }
    
        // Update the chatInput in the Redux store.
        dispatch(chatInputSliceActions.setChatInput(newInput));
    }, [chatInput, dispatch, item.emoteName]);

    const dynamicStyles = useMemo(
        () => ({
            emoteImage: {
                width: allowAutoResize ? 
                (item.width ?? size) : size,
                height: allowAutoResize ?
                (item.heigh ?? size) : size,
            },
            emoteItem: {
                margin: margin,
                height: allowAutoResize ?
                (item.heigh ?? size) : size,
                minHeight: allowAutoResize ?
                (item.heigh ?? size) : size,
                maxHeight: allowAutoResize ?
                (item.heigh ?? size) : size,
            },
            onPressable: {
                opacity: 0.5,
            },
        }),
        [size, margin, allowAutoResize]
    );

    return (
        <Pressable
            onPress={handlePress}
            style={({ pressed }) => [
                dynamicStyles.emoteItem,
                pressed && dynamicStyles.onPressable,
            ]}
        >
            <Image
                key={item.emoteUrl}
                source={{ uri: item.emoteUrl }}
                style={dynamicStyles.emoteImage}
                contentFit="contain"
                cachePolicy="disk"
            />
        </Pressable>
    );
}

export default memo(RenderEmoteItem);
