import React from "react";
import { Platform, KeyboardAvoidingView } from "react-native";


/**
 * IOSWrapper is a component that wraps its children in a KeyboardAvoidingView without affecting android devices
 * @param {object} props The props object
 * @param {ReactNode} props.children The children to be rendered inside the wrapper
 * @param {object} props.style The style to be applied to the KeyboardAvoidingView
 * @param {string} props.behavior The behavior prop for the KeyboardAvoidingView
 * 
 **/
const IOSKeyboardAvoidingView = ({ children, style, behavior }) => {
    if (Platform.OS === "ios") {
        return (
            <KeyboardAvoidingView
                style={style}
                behavior={behavior || "padding"}
            >
                {children}
            </KeyboardAvoidingView>
        );
    }
    return <>{children}</>;
};

export default IOSKeyboardAvoidingView;