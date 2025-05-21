import { useMemo } from "react";
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
} from "react-native";
import { Image } from "expo-image";
import Colors from "../../constants";
import { useDispatch, useSelector } from "react-redux";
import { emoteDetailsModalSliceActions } from "../../store/EmoteDetailsModal/emoteDetailsModal-slice";
import EmoteBehavior from "./EmoteBahavior";

function EmoteDetailsModal({ screenWidth }) {
    const dispatch = useDispatch();

    const emoteDetailsModalVisible = useSelector(
        (state) => state.emoteDetailsModal.emoteDetailsModalVisible
    );
    const emoteDetails = useSelector(
        (state) => state.emoteDetailsModal.emoteDetails
    );
    // secondEmoteDetails is now a list of objects.
    const secondEmoteDetails = useSelector(
        (state) => state.emoteDetailsModal.secondEmoteDetails
    );

    const onClose = () => {
        dispatch(emoteDetailsModalSliceActions.setEmoteDetailsModalVisible(false));
        dispatch(emoteDetailsModalSliceActions.setEmoteDetails({}));
        dispatch(emoteDetailsModalSliceActions.setSecondEmoteDetails([]));
    };

    const dynamicStyles = useMemo(
        () => ({
            modalContainer: {
                flex: 1,
                justifyContent: "flex-end",
                backgroundColor: "rgba(0, 0, 0, 0.10)",
                width: screenWidth,
            },
            modalImage: {
                width: emoteDetails.width ? emoteDetails.width : 64,
                height: emoteDetails.height ? emoteDetails.height : 64,
                marginBottom: 10,
            },
        }),
        [emoteDetails, screenWidth]
    );

    // Combine flags from all second emotes if needed (for EmoteBehavior usage).
    const combinedFlags = useMemo(() => {
        if (
            Array.isArray(secondEmoteDetails) &&
            secondEmoteDetails.length > 0
        ) {
            return secondEmoteDetails
                .map((emote) =>
                    Array.isArray(emote.flag) ? emote.flag : [emote.flag]
                )
                .flat();
        }
        return [];
    }, [secondEmoteDetails, emoteDetails]);

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={emoteDetailsModalVisible}
            onRequestClose={onClose}
            supportedOrientations={["portrait", "landscape"]}
        >
            <View style={dynamicStyles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>
                        {emoteDetails.emoteName}
                    </Text>
                    { secondEmoteDetails.length > 0 &&
                        <View style={styles.emotesRowMulti}>
                            <EmoteBehavior
                                mainEmote={emoteDetails}
                                flaggedEmotes={secondEmoteDetails}
                                flaggedEmoteNum={combinedFlags}
                            />
                        </View>
                    }
                    {/* Always show the list if secondEmoteDetails has items */}
                    {Array.isArray(secondEmoteDetails) &&
                    secondEmoteDetails.length > 0 ? (
                        <View style={styles.secondEmoteList}>
                            {secondEmoteDetails.map((emote, idx) => (
                                <View key={idx} style={styles.secondEmoteItem}>
                                    <Text style={styles.secondEmoteText}>
                                        + {emote.emoteName}:
                                    </Text>
                                    <Image
                                        source={{ uri: emote.emoteUrl }}
                                        style={styles.secondEmoteImage}
                                        contentFit="contain"
                                        cachePolicy="memory"
                                    />
                                    <Text style={styles.providerText}>
                                        {emote.type}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <>
                            <Image
                                source={{ uri: emoteDetails.emoteUrl }}
                                style={styles.modalImage}
                                contentFit="contain"
                                cachePolicy="memory"
                            />
                            <Text style={styles.modalInfo}>
                                Provider: {emoteDetails.type}
                            </Text>
                        </>
                    )}
                    {/* (Optionally) If you want to render grouped emotes via EmoteBehavior when there are more than one,
                        you could add an additional branch here. */}
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContent: {
        backgroundColor: Colors.twitchBlack950,
        padding: 20,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
        color: Colors.twitchWhite1000,
    },
    emotesRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
    },
    emotesRowMulti: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
        flexWrap: "wrap",
        transform: [{ translateY: 0 }, { scale: 1.25 }],
    },
    secondEmoteList: {
        marginBottom: 10,
    },
    secondEmoteItem: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 2,
    },
    secondEmoteText: {
        fontSize: 14,
        color: Colors.twitchWhite1000,
        marginRight: 5,
    },
    secondEmoteImage: {
        width: 32,
        height: 32,
    },
    providerText: {
        fontSize: 12,
        color: Colors.twitchWhite1000,
        marginLeft: 5,
    },
    modalInfo: {
        fontSize: 14,
        marginBottom: 20,
        color: Colors.twitchWhite1000,
    },
    closeButton: {
        alignSelf: "center",
        backgroundColor: Colors.twitchPurple1000,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginTop: 20,
    },
    closeButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    modalImage: {
        width: 64,
        height: 64,
        marginBottom: 10,
    },
});

export default EmoteDetailsModal;