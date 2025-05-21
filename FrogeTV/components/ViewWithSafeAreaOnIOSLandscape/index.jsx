import React from "react";
import { Platform, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

/**
 * ViewWithSafeAreaOnIOSLandscape wraps its children in a SafeAreaView on iOS.
 * When in portrait (phoneIsPotrait is true) it applies 0 safe area padding.
 * In landscape, it renders a normal SafeAreaView.
 *
 * @param {object} props
 * @param {ReactNode} props.children - Content to render.
 * @param {object} [props.style={flex:1}] - Style applied to the container.
 * @param {function} [props.setWidth] - Optional setter that receives the container width on layout.
 */
const ViewWithSafeAreaOnIOSLandscape = ({
    children,
    style = { flex: 1 },
}) => {
    const phoneIsPotrait = useSelector((state) => state.phone.phoneIsPotrait);


    if (Platform.OS === "ios") {
        if (phoneIsPotrait) {
            // In portrait, apply 0 safe area padding by specifying no edges.
            return (
                <SafeAreaView style={style} edges={[]}>
                    {children}
                </SafeAreaView>
            );
        } else {
            // In landscape, render a normal SafeAreaView (uses system safe area insets).
            return (
                <SafeAreaView style={style}>
                    {children}
                </SafeAreaView>
            );
        }
    }

    return (
        <View style={style}>
            {children}
        </View>
    );
};

export default ViewWithSafeAreaOnIOSLandscape;
